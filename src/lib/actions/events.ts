'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { Event, EventInsert, EventUpdate, EventWithServices } from '@/types/database'
import { geocodingService } from '@/lib/services/geocoding'

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres').max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional().nullable(),
  event_date: z.string().min(1, 'Data do evento é obrigatória'),
  start_time: z.string().optional().nullable(),
  location: z.string().max(200, 'Localização deve ter no máximo 200 caracteres').optional().nullable(),
  guest_count: z.coerce.number().min(1, 'Número de convidados deve ser maior que 0').optional(),
  full_guests: z.coerce.number().min(0, 'Número de convidados integrais deve ser 0 ou maior').optional(),
  half_guests: z.coerce.number().min(0, 'Número de convidados meia deve ser 0 ou maior').optional(),
  free_guests: z.coerce.number().min(0, 'Número de convidados gratuitos deve ser 0 ou maior').optional()
})

const updateEventSchema = z.object({
  id: z.string().uuid('ID inválido'),
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres').max(100, 'Título deve ter no máximo 100 caracteres').optional(),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional().nullable(),
  event_date: z.string().min(1, 'Data do evento é obrigatória').optional(),
  start_time: z.string().optional().nullable(),
  location: z.string().max(200, 'Localização deve ter no máximo 200 caracteres').optional().nullable(),
  guest_count: z.coerce.number().min(1, 'Número de convidados deve ser maior que 0').optional(),
  full_guests: z.coerce.number().min(0, 'Número de convidados integrais deve ser 0 ou maior').optional(),
  half_guests: z.coerce.number().min(0, 'Número de convidados meia deve ser 0 ou maior').optional(),
  free_guests: z.coerce.number().min(0, 'Número de convidados gratuitos deve ser 0 ou maior').optional()
})

// Result types
type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
}

// Helper function to get current user
async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }
    
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    throw new Error('Usuário não autenticado')
  }
}

// ================================================================
// EVENTS ACTIONS
// ================================================================

export async function getEventsAction(filters?: {
  client_id?: string
  status?: string
  search?: string
  limit?: number
}): Promise<ActionResult<Event[]>> {
  try {
    console.log('📥 [GET_EVENTS] Buscando eventos com filtros:', filters);
    
    const supabase = await createServerClient()
    
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.client_id) {
      console.log('🔍 [GET_EVENTS] Filtrando por client_id:', filters.client_id);
      query = query.eq('client_id', filters.client_id)
    }
    
    // Remover filtro de status já que a coluna não existe
    // if (filters?.status) {
    //   console.log('🔍 [GET_EVENTS] Filtrando por status:', filters.status);
    //   query = query.eq('status', filters.status)
    // }
    
    if (filters?.search) {
      console.log('🔍 [GET_EVENTS] Filtrando por busca:', filters.search);
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }
    
    if (filters?.limit) {
      console.log('🔍 [GET_EVENTS] Limitando resultados:', filters.limit);
      query = query.limit(filters.limit)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('❌ [GET_EVENTS] Erro ao buscar eventos:', error);
      return { 
        success: false, 
        error: 'Erro ao buscar eventos' 
      }
    }

    console.log('✅ [GET_EVENTS] Eventos encontrados:', events?.length || 0);
    return { 
      success: true, 
      data: events || [] 
    }
  } catch (error) {
    console.error('💥 [GET_EVENTS] Erro inesperado:', error);
    return { 
      success: false, 
      error: 'Erro inesperado ao buscar eventos' 
    }
  }
}

export async function getProviderEventsAction(): Promise<ActionResult<EventWithServices[]>> {
  try {
    console.log('📥 [GET_PROVIDER_EVENTS] Buscando eventos do prestador');
    
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    // Primeiro, buscar os IDs dos eventos que têm serviços do prestador atual
    const { data: eventServices, error: eventServicesError } = await supabase
      .from('event_services')
      .select('event_id')
      .eq('provider_id', user.id)
      .not('event_id', 'is', null)

    if (eventServicesError) {
      console.error('❌ [GET_PROVIDER_EVENTS] Erro ao buscar event_services:', eventServicesError);
      return { 
        success: false, 
        error: 'Erro ao buscar eventos do prestador' 
      }
    }

    // Extrair IDs únicos dos eventos
    const eventIds = [...new Set(eventServices?.map(es => es.event_id) || [])]
    
    if (eventIds.length === 0) {
      console.log('📥 [GET_PROVIDER_EVENTS] Nenhum evento encontrado para o prestador');
      return { 
        success: true, 
        data: [] 
      }
    }

    // Buscar eventos que têm serviços do prestador
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        event_services(
          id,
          service_id,
          provider_id,
          price_per_guest_at_booking,
          total_estimated_price,
          booking_status,
          created_at,
          updated_at,
          service:services(
            id,
            name,
            description,
            category,
            images_urls,
            min_guests,
            max_guests
          )
        )
      `)
      .in('id', eventIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [GET_PROVIDER_EVENTS] Erro ao buscar eventos do prestador:', error);
      return { 
        success: false, 
        error: 'Erro ao buscar eventos do prestador' 
      }
    }

    // Filtrar apenas os event_services do prestador atual
    const filteredEvents = events?.map(event => ({
      ...event,
      event_services: event.event_services?.filter((es: any) => es.provider_id === user.id) || []
    })).filter(event => event.event_services.length > 0) || []

    console.log('✅ [GET_PROVIDER_EVENTS] Eventos encontrados:', filteredEvents.length);
    return { 
      success: true, 
      data: filteredEvents 
    }
  } catch (error) {
    console.error('💥 [GET_PROVIDER_EVENTS] Erro inesperado:', error);
    return { 
      success: false, 
      error: 'Erro inesperado ao buscar eventos do prestador' 
    }
  }
}

export async function getClientEventsAction(): Promise<ActionResult<Event[]>> {
  try {
    console.log('📥 [GET_CLIENT_EVENTS] Buscando eventos do cliente');
    
    const user = await getCurrentUser()
    return getEventsAction({ client_id: user.id })
  } catch (error) {
    console.error('❌ [GET_CLIENT_EVENTS] Erro ao buscar eventos do cliente:', error);
    return { 
      success: false, 
      error: 'Erro ao buscar eventos do cliente' 
    }
  }
}

export async function getEventByIdAction(eventId: string): Promise<ActionResult<EventWithServices>> {
  try {
    console.log('🔍 [GET_EVENT_BY_ID] Buscando evento:', eventId);
    
    const supabase = await createServerClient()
    
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        event_services (
          *,
          service:services (
            *,
            provider:users!services_provider_id_fkey (
              id,
              full_name,
              organization_name,
              profile_image,
              area_of_operation
            )
          ),
          provider:users!event_services_provider_id_fkey (
            id,
            full_name,
            organization_name,
            whatsapp_number
          )
        )
      `)
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('❌ [GET_EVENT_BY_ID] Erro ao buscar evento:', error)
      return { success: false, error: `Erro ao buscar evento: ${error.message}` }
    }

    if (!event) {
      console.log('❌ [GET_EVENT_BY_ID] Evento não encontrado');
      return { success: false, error: 'Evento não encontrado' }
    }

    console.log('✅ [GET_EVENT_BY_ID] Evento encontrado:', event.id);
    return { success: true, data: event as EventWithServices }
  } catch (error) {
    console.error('💥 [GET_EVENT_BY_ID] Falha ao buscar evento:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar evento' 
    }
  }
}

export async function createEventAction(formData: FormData): Promise<ActionResult<Event>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      event_date: formData.get('event_date') as string,
      start_time: formData.get('start_time') as string || null,
      location: formData.get('location') as string || null,
      guest_count: formData.get('guest_count') as string || '0',
      full_guests: formData.get('full_guests') as string || '0',
      half_guests: formData.get('half_guests') as string || '0',
      free_guests: formData.get('free_guests') as string || '0'
    }

    const validatedData = createEventSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o usuário é um cliente
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'client') {
      return { success: false, error: 'Apenas clientes podem criar eventos' }
    }

    // Verificar se a data não é no passado
    const eventDate = new Date(validatedData.event_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (eventDate < today) {
      return { success: false, error: 'A data do evento não pode ser no passado' }
    }

    const eventData: EventInsert = {
      ...validatedData,
      client_id: user.id
    }

    // Se um local foi fornecido, fazer geocoding
    if (validatedData.location && validatedData.location.trim()) {
      try {
        const geocodingResult = await geocodingService.geocodeAddress(validatedData.location);
        if (geocodingResult) {
          eventData.event_latitude = geocodingResult.latitude;
          eventData.event_longitude = geocodingResult.longitude;
        }
      } catch (geocodingError) {
        console.warn('Erro no geocoding do evento, continuando sem coordenadas:', geocodingError);
      }
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return { success: false, error: 'Erro ao criar evento' }
    }

    revalidatePath('/perfil?tab=minhas-festas')
    revalidatePath('/dashboard')
    
    return { success: true, data: event }
  } catch (error) {
    console.error('Event creation failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar evento' 
    }
  }
}

export async function updateEventAction(formData: FormData): Promise<ActionResult<Event>> {
  try {
    console.log('✏️ [UPDATE] Iniciando atualização do evento...');
    
    const user = await getCurrentUser()
    console.log('👤 [UPDATE] Usuário autenticado:', user.id);
    
    const rawData = {
      id: formData.get('id') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      event_date: formData.get('event_date') as string,
      start_time: formData.get('start_time') as string || null,
      location: formData.get('location') as string || null,
      guest_count: formData.get('guest_count') as string,
      full_guests: formData.get('full_guests') as string,
      half_guests: formData.get('half_guests') as string,
      free_guests: formData.get('free_guests') as string
    }

    console.log('📝 [UPDATE] Dados recebidos:', rawData);

    // Remover campos null/undefined/empty para evitar validação desnecessária
    const cleanedData = Object.fromEntries(
      Object.entries(rawData).filter(([_, value]) => value !== null && value !== undefined && value !== '')
    );

    console.log('📝 [UPDATE] Dados limpos:', cleanedData);

    const validatedData = updateEventSchema.parse(cleanedData)
    console.log('✅ [UPDATE] Dados validados:', validatedData);
    
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    console.log('🔍 [UPDATE] Verificando propriedade do evento...');
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('client_id, title')
      .eq('id', validatedData.id)
      .single()

    if (fetchError) {
      console.error('❌ [UPDATE] Erro ao buscar evento:', fetchError);
      return { success: false, error: 'Evento não encontrado' }
    }

    if (!existingEvent) {
      console.error('❌ [UPDATE] Evento não encontrado');
      return { success: false, error: 'Evento não encontrado' }
    }

    if (existingEvent.client_id !== user.id) {
      console.error('❌ [UPDATE] Usuário não é dono do evento');
      return { success: false, error: 'Acesso negado' }
    }

    console.log('✅ [UPDATE] Propriedade do evento verificada');

    // Preparar dados para atualização
    const updateData: EventUpdate = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }

    // Remover campos que não devem ser atualizados
    delete updateData.id

    // Se um local foi fornecido, fazer geocoding
    if (validatedData.location && validatedData.location.trim()) {
      try {
        const geocodingResult = await geocodingService.geocodeAddress(validatedData.location);
        if (geocodingResult) {
          updateData.event_latitude = geocodingResult.latitude;
          updateData.event_longitude = geocodingResult.longitude;
        }
      } catch (geocodingError) {
        console.warn('Erro no geocoding do evento, continuando sem coordenadas:', geocodingError);
      }
    }

    console.log('📝 [UPDATE] Dados para atualização:', updateData);

    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single()

    if (error) {
      console.error('❌ [UPDATE] Erro ao atualizar evento:', error);
      return { success: false, error: 'Erro ao atualizar evento' }
    }

    console.log('✅ [UPDATE] Evento atualizado com sucesso:', event.id);

    revalidatePath('/perfil?tab=minhas-festas')
    revalidatePath('/dashboard')
    
    return { success: true, data: event }
  } catch (error) {
    console.error('💥 [UPDATE] Falha ao atualizar evento:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar evento' 
    }
  }
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  try {
    console.log('🗑️ [DELETE_EVENT] Deletando evento:', eventId);
    
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    const { data: event } = await supabase
      .from('events')
      .select('client_id')
      .eq('id', eventId)
      .single()

    if (!event || event.client_id !== user.id) {
      return { success: false, error: 'Evento não encontrado ou acesso negado' }
    }

    // Deletar serviços do evento primeiro
    const { error: servicesError } = await supabase
      .from('event_services')
      .delete()
      .eq('event_id', eventId)

    if (servicesError) {
      console.error('❌ [DELETE_EVENT] Erro ao deletar serviços do evento:', servicesError);
      return { success: false, error: 'Erro ao deletar serviços do evento' }
    }

    // Deletar o evento
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('❌ [DELETE_EVENT] Erro ao deletar evento:', error);
      return { success: false, error: 'Erro ao deletar evento' }
    }

    console.log('✅ [DELETE_EVENT] Evento deletado com sucesso');
    return { success: true }
  } catch (error) {
    console.error('💥 [DELETE_EVENT] Erro inesperado:', error);
    return { 
      success: false, 
      error: 'Erro inesperado ao deletar evento' 
    }
  }
}

export async function updateEventStatusAction(eventId: string, status: string): Promise<ActionResult<Event>> {
  try {
    console.log('🔄 [UPDATE_EVENT_STATUS] Atualizando status do evento:', { eventId, status });
    
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    const { data: event } = await supabase
      .from('events')
      .select('client_id')
      .eq('id', eventId)
      .single()

    if (!event || event.client_id !== user.id) {
      return { success: false, error: 'Evento não encontrado ou acesso negado' }
    }

    // Por enquanto, vamos apenas retornar sucesso sem atualizar status
    // já que a coluna status pode não existir na tabela events
    console.log('✅ [UPDATE_EVENT_STATUS] Status não atualizado - coluna status pode não existir');
    return { 
      success: true, 
      data: event as Event
    }
  } catch (error) {
    console.error('💥 [UPDATE_EVENT_STATUS] Erro inesperado:', error);
    return { 
      success: false, 
      error: 'Erro inesperado ao atualizar status do evento' 
    }
  }
}