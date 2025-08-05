import { createClient } from '@/lib/supabase/client'
import { ServiceWithProvider } from '@/types/database'

export interface ServiceFilters {
  category?: string
  search?: string
  location?: string
  min_price?: number
  max_price?: number
  limit?: number
}

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export async function getPublicServicesClient(filters?: ServiceFilters): Promise<ActionResult<ServiceWithProvider[]>> {
  try {
    console.log('🔍 [CLIENT_GET_PUBLIC_SERVICES] Iniciando busca de serviços com filtros:', filters);
    
    const supabase = createClient()
    
    // Obter o estado do usuário logado
    let userState: string | null = null
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      console.log(`🔍 [CLIENT_GET_PUBLIC_SERVICES] Usuário autenticado: ${user.id}`);
      
      const { data: userData } = await supabase
        .from('users')
        .select('state')
        .eq('id', user.id)
        .single()
      
      userState = userData?.state || null
      console.log('🔍 [CLIENT_GET_PUBLIC_SERVICES] Estado do usuário:', userState);
    } else {
      console.log('🔍 [CLIENT_GET_PUBLIC_SERVICES] Usuário não autenticado');
    }
    
    // Query base
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:users!services_provider_id_fkey (
          id,
          full_name,
          organization_name,
          profile_image,
          area_of_operation,
          state
        ),
        guest_tiers:service_guest_tiers (*)
      `)
      .eq('is_active', true)
      .eq('status', 'active')

    // FILTRO SIMPLES: Se usuário logado, filtrar apenas serviços do mesmo estado
    if (userState) {
      console.log('🔍 [CLIENT_GET_PUBLIC_SERVICES] Aplicando filtro: apenas serviços onde provider_state =', userState);
      query = query.eq('provider_state', userState)
    } else {
      console.log('🔍 [CLIENT_GET_PUBLIC_SERVICES] Sem filtro de estado - mostrando todos os serviços');
    }

    // Apply other filters
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
    
    // Ordenar por data de criação
    query = query.order('created_at', { ascending: false })
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: services, error } = await query

    if (error) {
      console.error('🔍 [CLIENT_GET_PUBLIC_SERVICES] Error fetching public services:', error)
      return { success: false, error: 'Erro ao buscar serviços' }
    }

    console.log('🔍 [CLIENT_GET_PUBLIC_SERVICES] Serviços retornados:', services?.length || 0);
    
    // Log adicional para debug: mostrar estados dos prestadores retornados
    if (services && services.length > 0) {
      const statesFound = [...new Set(services.map(s => s.provider_state).filter(Boolean))];
      console.log('🔍 [CLIENT_GET_PUBLIC_SERVICES] Estados dos serviços encontrados (provider_state):', statesFound);
      
      if (userState) {
        const allFromUserState = services.every(service => service.provider_state === userState);
        console.log('🔍 [CLIENT_GET_PUBLIC_SERVICES] Todos os serviços são do estado do usuário?', allFromUserState);
      }
    }

    return { success: true, data: services as ServiceWithProvider[] }
  } catch (error) {
    console.error('Client services fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar serviços' 
    }
  }
}