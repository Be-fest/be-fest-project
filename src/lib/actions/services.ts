'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { Service, ServiceInsert, ServiceUpdate, ServiceWithProvider, ServiceWithDetails, Subcategory } from '@/types/database'

// Validation schemas
const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  images_urls: z.array(z.string().url('URL da imagem inválida')).optional(),
  is_active: z.boolean().optional()
})

const updateServiceSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  description: z.string().optional().nullable(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  images_urls: z.array(z.string()).optional(),
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
    
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:users!services_provider_id_fkey (
          id,
          full_name,
          organization_name,
          logo_url,
          profile_image,
          area_of_operation
        )
      `)
      .order('created_at', { ascending: false })

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
    
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:users!services_provider_id_fkey (
          id,
          full_name,
          organization_name,
          logo_url,
          profile_image,
          area_of_operation
        ),
        guest_tiers:service_guest_tiers (*),
        date_surcharges:service_date_surcharges (*)
      `)
      .eq('id', serviceId)
      .single()

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
    
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category: formData.get('category') as string,
      images_urls: formData.getAll('images_urls').filter(url => url) as string[],
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
      base_price: 0, // Campo obrigatório mas não usado mais
      price_per_guest: null,
      min_guests: 0,
      max_guests: null
    }

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
    
    const rawData = {
      id: formData.get('id') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      category: formData.get('category') as string,
      images_urls: formData.getAll('images_urls').filter(url => url) as string[],
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
    
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:users!services_provider_id_fkey (
          id,
          full_name,
          organization_name,
          logo_url,
          profile_image,
          area_of_operation
        ),
        guest_tiers:service_guest_tiers (*)
      `)
      .eq('is_active', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

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
  totalEvents: number;
  activeServices: number;
  averageRating: number;
  totalRatings: number;
}>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    // Buscar total de eventos onde o prestador participou
    const { count: eventsCount, error: eventsError } = await supabase
      .from('event_services')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', user.id)
      .eq('booking_status', 'approved')

    if (eventsError) {
      console.error('Error fetching events count:', eventsError)
    }

    // Buscar total de serviços ativos
    const { count: servicesCount, error: servicesError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', user.id)
      .eq('is_active', true)
      .eq('status', 'active')

    if (servicesError) {
      console.error('Error fetching services count:', servicesError)
    }

    // Para avaliações, vamos usar valores padrão por enquanto já que não temos uma tabela de reviews ainda
    // Você pode implementar isso quando tiver uma tabela de avaliações/reviews
    const stats = {
      totalEvents: Number(eventsCount) || 0,
      activeServices: Number(servicesCount) || 0,
      averageRating: 0, // Implementar quando tiver sistema de avaliações
      totalRatings: 0   // Implementar quando tiver sistema de avaliações
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Provider stats fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas' 
    }
  }
} 

// Upload de imagem para o Supabase Storage
export async function uploadServiceImageAction(formData: FormData): Promise<ActionResult<string>> {
  try {
    const user = await getCurrentUser()
    const file = formData.get('image') as File
    
    if (!file) {
      return { success: false, error: 'Nenhum arquivo selecionado' }
    }

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
export async function getSubcategoriesAction(): Promise<ActionResult<Subcategory[]>> {
  try {
    const supabase = await createServerClient()

    const { data: subcategories, error } = await supabase
      .from('subcategories')
      .select('id, name, category_id, icon_url, created_at, updated_at')
      .order('name')

    if (error) {
      console.error('Error fetching subcategories:', error)
      return { success: false, error: 'Erro ao carregar subcategorias' }
    }

    return { success: true, data: subcategories || [] }
  } catch (error) {
    console.error('Subcategories fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado ao carregar subcategorias' 
    }
  }
} 