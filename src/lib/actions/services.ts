'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { Service, ServiceInsert, ServiceUpdate, ServiceWithProvider, ServiceWithDetails } from '@/types/database'

// Validation schemas
const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  base_price: z.coerce.number().min(0, 'Preço base deve ser maior ou igual a 0'),
  price_per_guest: z.coerce.number().min(0, 'Preço por convidado deve ser maior ou igual a 0').optional().nullable(),
  min_guests: z.coerce.number().min(0, 'Número mínimo de convidados deve ser maior ou igual a 0').optional(),
  max_guests: z.coerce.number().min(1, 'Número máximo de convidados deve ser maior que 0').optional().nullable(),
  images_urls: z.array(z.string().url('URL da imagem inválida')).optional()
})

const updateServiceSchema = z.object({
  id: z.string().uuid('ID inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres').optional(),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional().nullable(),
  category: z.string().min(1, 'Categoria é obrigatória').optional(),
  base_price: z.coerce.number().min(0, 'Preço base deve ser maior ou igual a 0').optional(),
  price_per_guest: z.coerce.number().min(0, 'Preço por convidado deve ser maior ou igual a 0').optional().nullable(),
  min_guests: z.coerce.number().min(0, 'Número mínimo de convidados deve ser maior ou igual a 0').optional(),
  max_guests: z.coerce.number().min(1, 'Número máximo de convidados deve ser maior que 0').optional().nullable(),
  images_urls: z.array(z.string().url('URL da imagem inválida')).optional(),
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
          area_of_operation
        ),
        guest_tiers:service_guest_tiers (*),
        age_pricing_rules:service_age_pricing_rules (*),
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

export async function getProviderServicesAction(): Promise<ActionResult<Service[]>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
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
      base_price: formData.get('base_price') as string,
      price_per_guest: formData.get('price_per_guest') as string || null,
      min_guests: formData.get('min_guests') as string || '0',
      max_guests: formData.get('max_guests') as string || null,
      images_urls: formData.getAll('images_urls').filter(url => url) as string[]
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
      is_active: true
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

    // Salvar regras de pricing por idade se fornecidas
    const pricingRulesData = formData.get('pricing_rules') as string
    if (pricingRulesData) {
      try {
        const pricingRules = JSON.parse(pricingRulesData)
        
        if (Array.isArray(pricingRules) && pricingRules.length > 0) {
                     const pricingRulesInsert = pricingRules.map((rule: any) => ({
             service_id: service.id,
             rule_description: String(rule.rule_description),
             age_min_years: Number(rule.age_min_years),
             age_max_years: rule.age_max_years ? Number(rule.age_max_years) : null,
             pricing_method: String(rule.pricing_method) as any,
             value: Number(rule.value)
           } as any))

          const { error: pricingRulesError } = await supabase
            .from('service_age_pricing_rules')
            .insert(pricingRulesInsert)

          if (pricingRulesError) {
            console.error('Error creating pricing rules:', pricingRulesError)
            // Não falhar a criação do serviço por causa das regras de pricing
          }
        }
      } catch (parseError) {
        console.error('Error parsing pricing rules:', parseError)
        // Não falhar a criação do serviço por causa das regras de pricing
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
      base_price: formData.get('base_price') as string,
      price_per_guest: formData.get('price_per_guest') as string || null,
      min_guests: formData.get('min_guests') as string,
      max_guests: formData.get('max_guests') as string || null,
      images_urls: formData.getAll('images_urls').filter(url => url) as string[],
      status: formData.get('status') as string,
      is_active: formData.get('is_active') === 'true'
    }

    const validatedData = updateServiceSchema.parse(rawData)
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
    if (validatedData.base_price !== undefined) {
      updateData.base_price = validatedData.base_price
    }
    if (validatedData.min_guests !== undefined) {
      updateData.min_guests = validatedData.min_guests
    }
    if (validatedData.max_guests !== undefined) {
      updateData.max_guests = validatedData.max_guests === null ? undefined : validatedData.max_guests
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
          area_of_operation
        )
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