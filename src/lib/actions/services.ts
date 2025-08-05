'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { Service, ServiceInsert, ServiceUpdate, ServiceWithProvider, ServiceWithDetails, Subcategory, SubcategoryWithCategory } from '@/types/database'

// Validation schemas
const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  images_urls: z.array(z.string()).optional().default([]),
  is_active: z.boolean().optional()
})

const updateServiceSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  description: z.string().optional().nullable(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  images_urls: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'inactive', 'pending_approval']).optional(),
  is_active: z.boolean().optional()
})

// Result types
type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
}

// Helper function to get current user
async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Usuário não autenticado')
  }
  
  return user
}

// ================================================================
// SERVICES ACTIONS
// ================================================================

export async function getServicesAction(filters?: {
  category?: string
  provider_id?: string
  is_active?: boolean
  status?: string
  search?: string
}): Promise<ActionResult<ServiceWithProvider[]>> {
  try {
    const supabase = await createServerClient()
    
    // Obter estado do usuário para filtrar serviços
    let userState: string | null = null
    try {
      const user = await getCurrentUser()
      const { data: userData } = await supabase
        .from('users')
        .select('state')
        .eq('id', user.id)
        .single()
      
      userState = userData?.state || null
    } catch (error) {
      console.log('Usuário não logado ou erro ao buscar estado, mostrando todos os serviços')
    }
    
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:users!services_provider_id_fkey (
          id,
          full_name,
          organization_name,
          profile_image,
          area_of_operation
        )
      `)
      .order('created_at', { ascending: false })
    
    // SEMPRE aplicar filtro por estado do usuário se disponível
    if (userState) {
      query = query.eq('provider_state', userState)
    }

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters?.provider_id) {
      query = query.eq('provider_id', filters.provider_id)
    }
    
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data: services, error } = await query

    if (error) {
      console.error('Error fetching services:', error)
      return { success: false, error: 'Erro ao buscar serviços' }
    }

    return { success: true, data: services as ServiceWithProvider[] }
  } catch (error) {
    console.error('Services fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar serviços' 
    }
  }
}

export async function getServiceByIdAction(serviceId: string): Promise<ActionResult<ServiceWithDetails>> {
  try {
    const supabase = await createServerClient()
    
    // Obter estado do usuário para filtrar serviços
    let userState: string | null = null
    try {
      const user = await getCurrentUser()
      const { data: userData } = await supabase
        .from('users')
        .select('state')
        .eq('id', user.id)
        .single()
      
      userState = userData?.state || null
    } catch (error) {
      console.log('Usuário não logado ou erro ao buscar estado, mostrando serviço se existir')
    }
    
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:users!services_provider_id_fkey (
          id,
          full_name,
          organization_name,
          profile_image,
          area_of_operation
        ),
        guest_tiers:service_guest_tiers (*)
      `)
      .eq('id', serviceId)
    
    // SEMPRE aplicar filtro por estado do usuário se disponível
    if (userState) {
      query = query.eq('provider_state', userState)
    }

    const { data: service, error } = await query.single()

    if (error) {
      console.error('Error fetching service:', error)
      return { success: false, error: 'Serviço não encontrado' }
    }

    return { success: true, data: service as ServiceWithDetails }
  } catch (error) {
    console.error('Service fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar serviço' 
    }
  }
}

export async function getProviderServicesAction(): Promise<ActionResult<ServiceWithDetails[]>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        guest_tiers:service_guest_tiers(*)
      `)
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching provider services:', error)
      return { success: false, error: 'Erro ao buscar seus serviços' }
    }

    return { success: true, data: services }
  } catch (error) {
    console.error('Provider services fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar seus serviços' 
    }
  }
}

export async function createServiceAction(formData: FormData): Promise<ActionResult<Service>> {
  try {
    const user = await getCurrentUser()
    
    // Processar imagens
    const imagesUrlsData = formData.get('images_urls') as string;
    console.log('📸 [CREATE_SERVICE] Dados de imagens recebidos:', imagesUrlsData);
    let imagesUrls: string[] = [];
    if (imagesUrlsData) {
      try {
        imagesUrls = JSON.parse(imagesUrlsData);
        console.log('📸 [CREATE_SERVICE] Imagens processadas:', imagesUrls);
      } catch (error) {
        console.error('Error parsing images_urls:', error);
        imagesUrls = [];
      }
    }

    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category: formData.get('category') as string,
      images_urls: imagesUrls,
      is_active: formData.get('is_active') === 'true'
    }

    const validatedData = createServiceSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o usuário é um prestador
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'provider') {
      return { success: false, error: 'Apenas prestadores podem criar serviços' }
    }

    const serviceData: ServiceInsert = {
      ...validatedData,
      provider_id: user.id,
      status: 'active',
      is_active: validatedData.is_active ?? true,
      min_guests: 0,
      max_guests: null,
      images_urls: validatedData.images_urls || []
    }
    
    console.log('📸 [CREATE_SERVICE] ServiceData com imagens:', serviceData);

    const { data: service, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      return { success: false, error: 'Erro ao criar serviço' }
    }

    // Salvar faixas de preço por número de convidados
    const guestTiersData = formData.get('guest_tiers') as string
    if (guestTiersData) {
      try {
        const guestTiers = JSON.parse(guestTiersData)
        
        if (Array.isArray(guestTiers) && guestTiers.length > 0) {
          const guestTiersInsert = guestTiers.map((tier: any) => ({
            service_id: service.id,
            min_total_guests: Number(tier.min_total_guests),
            max_total_guests: tier.max_total_guests ? Number(tier.max_total_guests) : null,
            base_price_per_adult: Number(tier.base_price_per_adult),
            tier_description: String(tier.tier_description)
          }))

          const { error: guestTiersError } = await supabase
            .from('service_guest_tiers')
            .insert(guestTiersInsert)

          if (guestTiersError) {
            console.error('Error creating guest tiers:', guestTiersError)
            // Não falhar a criação do serviço por causa das faixas de preço
          }
        }
      } catch (parseError) {
        console.error('Error parsing guest tiers:', parseError)
        // Não falhar a criação do serviço por causa das faixas de preço
      }
    }

    revalidatePath('/dashboard/prestador')
    revalidatePath('/prestadores')
    revalidatePath('/servicos')
    
    return { success: true, data: service }
  } catch (error) {
    console.error('Service creation failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar serviço' 
    }
  }
}

export async function updateServiceAction(formData: FormData): Promise<ActionResult<Service>> {
  try {
    const user = await getCurrentUser()
    
    // Processar imagens
    const imagesUrlsData = formData.get('images_urls') as string;
    console.log('📸 [UPDATE_SERVICE] Dados de imagens recebidos:', imagesUrlsData);
    let imagesUrls: string[] = [];
    if (imagesUrlsData) {
      try {
        imagesUrls = JSON.parse(imagesUrlsData);
        console.log('📸 [UPDATE_SERVICE] Imagens processadas:', imagesUrls);
      } catch (error) {
        console.error('Error parsing images_urls:', error);
        imagesUrls = [];
      }
    }

    const rawData = {
      id: formData.get('id') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category: formData.get('category') as string,
      images_urls: imagesUrls,
      status: (formData.get('status') as string) || undefined,
      is_active: formData.get('is_active') === 'true'
    }

    // Filtrar campos undefined/null/empty para evitar validação desnecessária
    const cleanedData = Object.fromEntries(
      Object.entries(rawData).filter(([key, value]) => 
        value !== undefined && value !== null && value !== ''
      )
    );
    
    const validatedData = updateServiceSchema.parse(cleanedData)
    const supabase = await createServerClient()

    // Verificar se o serviço pertence ao usuário
    const { data: existingService } = await supabase
      .from('services')
      .select('provider_id')
      .eq('id', validatedData.id)
      .single()

    if (!existingService || existingService.provider_id !== user.id) {
      return { success: false, error: 'Serviço não encontrado ou acesso negado' }
    }

    const updateData: Partial<ServiceUpdate> = {}
    
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description === null ? undefined : validatedData.description
    }
    if (validatedData.category !== undefined) {
      updateData.category = validatedData.category
    }

    if (validatedData.is_active !== undefined) {
      updateData.is_active = validatedData.is_active
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }
    if (validatedData.images_urls !== undefined) {
      updateData.images_urls = validatedData.images_urls
    }

    console.log('📸 [UPDATE_SERVICE] UpdateData com imagens:', updateData);

    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating service:', error)
      return { success: false, error: 'Erro ao atualizar serviço' }
    }

    // Atualizar faixas de preço por número de convidados
    const guestTiersData = formData.get('guest_tiers') as string
    if (guestTiersData) {
      try {
        const guestTiers = JSON.parse(guestTiersData)
        
        if (Array.isArray(guestTiers) && guestTiers.length > 0) {
          // Primeiro, deletar todas as faixas existentes
          await supabase
            .from('service_guest_tiers')
            .delete()
            .eq('service_id', validatedData.id)

          // Depois, inserir as novas faixas
          const guestTiersInsert = guestTiers.map((tier: any) => ({
            service_id: validatedData.id,
            min_total_guests: Number(tier.min_total_guests),
            max_total_guests: tier.max_total_guests ? Number(tier.max_total_guests) : null,
            base_price_per_adult: Number(tier.base_price_per_adult),
            tier_description: String(tier.tier_description)
          }))

          const { error: guestTiersError } = await supabase
            .from('service_guest_tiers')
            .insert(guestTiersInsert)

          if (guestTiersError) {
            console.error('Error updating guest tiers:', guestTiersError)
            // Não falhar a atualização do serviço por causa das faixas de preço
          }
        }
      } catch (parseError) {
        console.error('Error parsing guest tiers:', parseError)
        // Não falhar a atualização do serviço por causa das faixas de preço
      }
    }

    revalidatePath('/dashboard/prestador')
    revalidatePath('/prestadores')
    revalidatePath('/servicos')
    
    return { success: true, data: service }
  } catch (error) {
    console.error('Service update failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar serviço' 
    }
  }
}

export async function toggleServiceStatusAction(serviceId: string): Promise<ActionResult<Service>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o serviço pertence ao usuário
    const { data: existingService } = await supabase
      .from('services')
      .select('provider_id, is_active')
      .eq('id', serviceId)
      .single()

    if (!existingService || existingService.provider_id !== user.id) {
      return { success: false, error: 'Serviço não encontrado ou acesso negado' }
    }

    const { data: service, error } = await supabase
      .from('services')
      .update({ is_active: !existingService.is_active })
      .eq('id', serviceId)
      .select()
      .single()

    if (error) {
      console.error('Error toggling service status:', error)
      return { success: false, error: 'Erro ao alterar status do serviço' }
    }

    revalidatePath('/dashboard/prestador')
    revalidatePath('/prestadores')
    revalidatePath('/servicos')
    
    return { success: true, data: service }
  } catch (error) {
    console.error('Service status toggle failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao alterar status do serviço' 
    }
  }
}

export async function deleteServiceAction(serviceId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o serviço pertence ao usuário
    const { data: existingService } = await supabase
      .from('services')
      .select('provider_id')
      .eq('id', serviceId)
      .single()

    if (!existingService || existingService.provider_id !== user.id) {
      return { success: false, error: 'Serviço não encontrado ou acesso negado' }
    }

    // Verificar se o serviço tem bookings ativos
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('service_id', serviceId)
      .in('status', ['pending', 'confirmed', 'paid'])
      .limit(1)

    if (activeBookings && activeBookings.length > 0) {
      return { success: false, error: 'Não é possível excluir serviço com reservas ativas' }
    }

    // Verificar se o serviço tem event_services ativos
    const { data: activeEventServices } = await supabase
      .from('event_services')
      .select('id')
      .eq('service_id', serviceId)
              .in('booking_status', ['pending_provider_approval', 'approved', 'completed'])
      .limit(1)

    if (activeEventServices && activeEventServices.length > 0) {
      return { success: false, error: 'Não é possível excluir serviço com solicitações ativas' }
    }

    // Excluir registros relacionados primeiro (em ordem de dependência)
    
    // 1. Excluir service_guest_tiers
    const { error: guestTiersError } = await supabase
      .from('service_guest_tiers')
      .delete()
      .eq('service_id', serviceId)

    if (guestTiersError) {
      console.error('Error deleting service guest tiers:', guestTiersError)
      return { success: false, error: 'Erro ao excluir faixas de preço do serviço' }
    }

    // 2. Excluir event_services (apenas os que não estão ativos)
    const { error: eventServicesError } = await supabase
      .from('event_services')
      .delete()
      .eq('service_id', serviceId)
              .not('booking_status', 'in', '(pending_provider_approval,approved,completed)')

    if (eventServicesError) {
      console.error('Error deleting event services:', eventServicesError)
      // Não falhar aqui, pois pode não ter event_services
    }

    // 3. Finalmente, excluir o serviço
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)

    if (error) {
      console.error('Error deleting service:', error)
      return { success: false, error: 'Erro ao excluir serviço' }
    }

    revalidatePath('/dashboard/prestador')
    revalidatePath('/prestadores')
    revalidatePath('/servicos')
    
    return { success: true }
  } catch (error) {
    console.error('Service deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao excluir serviço' 
    }
  }
}

// ================================================================
// PUBLIC SERVICES ACTIONS
// ================================================================

export async function getPublicServicesAction(filters?: {
  category?: string
  search?: string
  location?: string
  min_price?: number
  max_price?: number
  limit?: number
}): Promise<ActionResult<ServiceWithProvider[]>> {
  try {
    const supabase = await createServerClient()
    
    // Obter estado do usuário para filtrar serviços
    let userState: string | null = null
    try {
      const user = await getCurrentUser()
      const { data: userData } = await supabase
        .from('users')
        .select('state')
        .eq('id', user.id)
        .single()
      
      userState = userData?.state || null
    } catch (error) {
      console.log('Usuário não logado ou erro ao buscar estado, mostrando todos os serviços')
    }
    
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:users!services_provider_id_fkey (
          id,
          full_name,
          organization_name,
          profile_image,
          area_of_operation
        ),
        guest_tiers:service_guest_tiers (*)
      `)
      .eq('is_active', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    // SEMPRE aplicar filtro por estado do usuário se disponível
     if (userState) {
       query = query.eq('provider_state', userState)
     }

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    if (filters?.min_price !== undefined) {
      query = query.gte('base_price', filters.min_price)
    }
    
    if (filters?.max_price !== undefined) {
      query = query.lte('base_price', filters.max_price)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: services, error } = await query

    if (error) {
      console.error('Error fetching public services:', error)
      return { success: false, error: 'Erro ao buscar serviços' }
    }

    return { success: true, data: services as ServiceWithProvider[] }
  } catch (error) {
    console.error('Public services fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar serviços' 
    }
  }
}

export async function getServicesByCategoryAction(category: string): Promise<ActionResult<ServiceWithProvider[]>> {
  return getPublicServicesAction({ category })
}

export async function searchServicesAction(searchTerm: string): Promise<ActionResult<ServiceWithProvider[]>> {
  return getPublicServicesAction({ search: searchTerm })
}

// Novo: Action para buscar estatísticas do prestador
export async function getProviderStatsAction(): Promise<ActionResult<{
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  activeServices: number
  totalRevenue: number
  completedEvents: number
}>> {
  try {
    console.log('📊 [GET_PROVIDER_STATS] Buscando estatísticas do prestador');
    
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    // Verificar se o usuário é um prestador
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'provider') {
      return { 
        success: false, 
        error: 'Apenas prestadores podem acessar estas estatísticas' 
      }
    }

    // Buscar serviços ativos do prestador
    const { data: activeServices, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .eq('provider_id', user.id)
      .eq('is_active', true)

    if (servicesError) {
      console.error('❌ [GET_PROVIDER_STATS] Erro ao buscar serviços ativos:', servicesError);
    }

    // Buscar event_services do prestador
    const { data: eventServices, error: eventServicesError } = await supabase
      .from('event_services')
      .select(`
        id,
        booking_status,
        total_estimated_price,
        event:events(
          id,
          title,
          event_date
        )
      `)
      .eq('provider_id', user.id)

    if (eventServicesError) {
      console.error('❌ [GET_PROVIDER_STATS] Erro ao buscar event_services:', eventServicesError);
    }

    // Calcular estatísticas
    const totalRequests = eventServices?.length || 0
    const pendingRequests = eventServices?.filter(es => es.booking_status === 'pending_provider_approval').length || 0
          const approvedRequests = eventServices?.filter(es => es.booking_status === 'approved').length || 0
    const activeServicesCount = activeServices?.length || 0
    
    // Calcular receita total estimada
    const totalRevenue = eventServices?.reduce((sum, es) => {
      return sum + (es.total_estimated_price || 0)
    }, 0) || 0

    // Eventos realizados (com status confirmed ou completed)
    const completedEvents = eventServices?.filter(es => 
              es.booking_status === 'completed'
    ).length || 0

    const stats = {
      totalRequests,
      pendingRequests,
      approvedRequests,
      activeServices: activeServicesCount,
      totalRevenue,
      completedEvents
    }

    console.log('✅ [GET_PROVIDER_STATS] Estatísticas calculadas:', stats);
    return { 
      success: true, 
      data: stats 
    }
  } catch (error) {
    console.error('💥 [GET_PROVIDER_STATS] Erro inesperado:', error);
    return { 
      success: false, 
      error: 'Erro inesperado ao buscar estatísticas do prestador' 
    }
  }
}

// Upload de imagem para o Supabase Storage
export async function uploadServiceImageAction(formData: FormData): Promise<ActionResult<string>> {
  try {
    console.log('📸 [UPLOAD_SERVICE_IMAGE] Iniciando upload');
    const user = await getCurrentUser()
    const file = formData.get('image') as File
    
    if (!file) {
      console.log('❌ [UPLOAD_SERVICE_IMAGE] Nenhum arquivo selecionado');
      return { success: false, error: 'Nenhum arquivo selecionado' }
    }
    
    console.log('📸 [UPLOAD_SERVICE_IMAGE] Arquivo recebido:', file.name, file.size, file.type);

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' }
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'Arquivo muito grande. Tamanho máximo: 5MB' }
    }

    const supabase = await createServerClient()

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload para o bucket 'be-fest-images'
    const { data, error } = await supabase.storage
      .from('be-fest-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload:', error)
      return { success: false, error: 'Erro ao fazer upload da imagem' }
    }

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('be-fest-images')
      .getPublicUrl(fileName)

    console.log('✅ [UPLOAD_SERVICE_IMAGE] Upload concluído:', publicUrl);

    return { 
      success: true, 
      data: publicUrl 
    }

  } catch (error) {
    console.error('Erro no upload de imagem:', error)
    return { success: false, error: 'Erro inesperado ao fazer upload' }
  }
}

// Deletar imagem do Supabase Storage
export async function deleteServiceImageAction(imageUrl: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Extrair o path do arquivo da URL do Supabase Storage
    // URL format: https://xxx.supabase.co/storage/v1/object/public/be-fest-images/userId/filename
    const urlParts = imageUrl.split('/be-fest-images/')
    if (urlParts.length < 2) {
      return { success: false, error: 'URL de imagem inválida' }
    }
    
    const fileName = urlParts[1] // userId/filename.ext
    
    // Verificar se o arquivo pertence ao usuário
    if (!fileName.startsWith(`${user.id}/`)) {
      return { success: false, error: 'Acesso negado para deletar esta imagem' }
    }

    const { error } = await supabase.storage
      .from('be-fest-images')
      .remove([fileName])

    if (error) {
      console.error('Erro ao deletar imagem:', error)
      return { success: false, error: 'Erro ao deletar imagem' }
    }

    return { success: true }

  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return { success: false, error: 'Erro inesperado ao deletar imagem' }
  }
} 

// Buscar subcategorias do banco de dados
export async function getSubcategoriesAction(categoryId?: string): Promise<ActionResult<SubcategoryWithCategory[]>> {
  try {
    const supabase = await createServerClient()

    let query = supabase
      .from('subcategories')
      .select(`
        id, 
        name, 
        category_id, 
        icon_url, 
        created_at, 
        updated_at,
        categories!subcategories_category_id_fkey (
          name
        )
      `)

    // Filtrar por category_id se fornecido
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: subcategories, error } = await query.order('name')

    if (error) {
      console.error('Error fetching subcategories:', error)
      return { success: false, error: 'Erro ao carregar subcategorias' }
    }

    // Transformar os dados para incluir o nome da categoria
    const transformedSubcategories = subcategories?.map(subcategory => ({
      ...subcategory,
      category_name: (subcategory as any).categories?.name
    })) || []

    return { success: true, data: transformedSubcategories }
  } catch (error) {
    console.error('Subcategories fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado ao carregar subcategorias' 
    }
  }
} 

// ================================================================
// PUBLIC PROVIDERS ACTIONS
// ================================================================

export async function getPublicProvidersAction(filters?: {
  search?: string
  limit?: number
}): Promise<ActionResult<Array<{
  id: string;
  organization_name?: string;
  profile_image?: string;
  area_of_operation?: string;
  services_count: number;
  average_rating?: number;
  created_at: string;
}>>> {
  try {
    const supabase = await createServerClient()
    
    // Obter estado do usuário para filtrar prestadores
    let userState: string | null = null
    try {
      const user = await getCurrentUser()
      const { data: userData } = await supabase
        .from('users')
        .select('state')
        .eq('id', user.id)
        .single()
      
      userState = userData?.state || null
    } catch (error) {
      console.log('Usuário não logado ou erro ao buscar estado, mostrando todos os prestadores')
    }
    
    // Primeiro, buscar todos os prestadores
    let query = supabase
      .from('users')
      .select(`
        id,
        organization_name,
        profile_image,
        area_of_operation,
        created_at,
        state
      `)
      .eq('role', 'provider')
    
    // SEMPRE aplicar filtro por estado do usuário se disponível
    if (userState) {
      query = query.eq('state', userState)
    }

    // Aplicar filtros
    if (filters?.search) {
      query = query.or(`organization_name.ilike.%${filters.search}%,area_of_operation.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: providers, error } = await query

    if (error) {
      console.error('Error fetching providers:', error)
      return { success: false, error: error.message }
    }

    if (!providers || providers.length === 0) {
      return { success: true, data: [] }
    }

    // Processar dados para incluir contagem de serviços
    const processedProviders = await Promise.all(
      providers.map(async (provider) => {
        // Buscar contagem de serviços ativos
        const { count: servicesCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', provider.id)
          .eq('is_active', true)

        return {
          id: provider.id,
          organization_name: provider.organization_name,
          profile_image: provider.profile_image,
          area_of_operation: provider.area_of_operation,
          services_count: servicesCount || 0,
          average_rating: 0, // Implementar quando tiver sistema de avaliações
          created_at: provider.created_at
        }
      })
    )

    return { success: true, data: processedProviders }
  } catch (error) {
    console.error('getPublicProvidersAction failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar prestadores' 
    }
  }
}

export async function getSimpleProvidersAction(): Promise<ActionResult<Array<{
  id: string;
  full_name: string;
  organization_name?: string;
  profile_image?: string;
  service_categories: string[];
}>>> {
  try {
    const supabase = await createServerClient()

    // Obter estado do usuário para filtrar prestadores
    let userState: string | null = null
    try {
      const user = await getCurrentUser()
      const { data: userData } = await supabase
        .from('users')
        .select('state')
        .eq('id', user.id)
        .single()
      
      userState = userData?.state || null
    } catch (error) {
      console.log('Usuário não logado ou erro ao buscar estado, mostrando todos os prestadores')
    }

    // Buscar prestadores com serviços ativos
    let query = supabase
      .from('users')
      .select(`
        id,
        full_name,
        organization_name,
        profile_image,
        state,
        services!inner (
          id,
          category,
          is_active
        )
      `)
      .eq('role', 'provider')
      .eq('services.is_active', true)
    
    // SEMPRE aplicar filtro por estado do usuário se disponível
    if (userState) {
      query = query.eq('state', userState)
    }
    
    const { data: providers, error } = await query

    if (error) {
      console.error('Error fetching simple providers:', error)
      return { success: false, error: error.message }
    }

    // Processar dados para incluir categorias únicas
    const processedProviders = providers.map((provider) => {
      // Extrair categorias únicas dos serviços
      const categories = [...new Set(
        provider.services
          .filter((service: any) => service.is_active)
          .map((service: any) => service.category)
          .filter(Boolean)
      )]

      return {
        id: provider.id,
        full_name: provider.full_name,
        organization_name: provider.organization_name,
        profile_image: provider.profile_image,
        service_categories: categories
      }
    })

    return { success: true, data: processedProviders }
  } catch (error) {
    console.error('getSimpleProvidersAction failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar prestadores'
    }
  }
}