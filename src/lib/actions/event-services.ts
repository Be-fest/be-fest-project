'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { EventService, EventServiceInsert, EventServiceUpdate, EventServiceWithDetails, EventServiceStatus } from '@/types/database'
import { calculateAdvancedPrice } from '@/utils/formatters'

// Validation schemas
const createEventServiceSchema = z.object({
  event_id: z.string().uuid('ID do evento inválido'),
  service_id: z.string().uuid('ID do serviço inválido'),
  client_notes: z.string().max(500, 'Notas do cliente devem ter no máximo 500 caracteres').optional().nullable()
})

const updateEventServiceSchema = z.object({
  id: z.string().uuid('ID inválido'),
  price_per_guest_at_booking: z.coerce.number().min(0, 'Preço por convidado deve ser maior ou igual a 0').optional().nullable(),
  total_estimated_price: z.coerce.number().min(0, 'Preço total deve ser maior ou igual a 0').optional().nullable(),
  booking_status: z.enum(['pending_provider_approval', 'approved', 'in_progress', 'completed', 'cancelled']).optional()
})

// Result types
type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
  message?: string
}

// Helper functions
async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }
  
  return user
}

/**
 * Calcula o preço correto do serviço baseado na lógica especificada:
 * 1. Consultar full_guests na tabela events do evento
 * 2. Ver preço base para convidados no service_guest_tiers
 * 3. Salvar preço em price_per_guest_at_booking na tabela event_services
 * 4. Fazer cálculo de preço e salvar no total_estimated_price
 */
async function calculateServicePrice(
  eventId: string,
  serviceId: string,
  eventServiceId: string
): Promise<{ pricePerGuest: number; totalPrice: number }> {
  const supabase = await createServerClient()
  
  // 1. Buscar dados do evento (full_guests, half_guests)
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('full_guests, half_guests, guest_count')
    .eq('id', eventId)
    .single()
  
  if (eventError || !event) {
    throw new Error('Evento não encontrado')
  }
  
  const fullGuests = event.full_guests || 0
  const halfGuests = event.half_guests || 0
  const totalGuests = fullGuests + halfGuests
  
  // 2. Buscar tiers de preço do serviço
  const { data: guestTiers, error: tiersError } = await supabase
    .from('service_guest_tiers')
    .select('*')
    .eq('service_id', serviceId)
    .order('min_total_guests', { ascending: true })
  
  if (tiersError) {
    throw new Error('Erro ao buscar tiers de preço')
  }
  
  // 3. Encontrar o tier apropriado baseado no total de convidados
  let pricePerGuest = 0
  
  if (guestTiers && guestTiers.length > 0) {
    // Encontrar o tier que se aplica ao número total de convidados
    const applicableTier = guestTiers.find(tier => {
      const minGuests = tier.min_total_guests
      const maxGuests = tier.max_total_guests || Infinity
      return totalGuests >= minGuests && totalGuests <= maxGuests
    })
    
    if (applicableTier) {
      pricePerGuest = applicableTier.base_price_per_adult
    } else {
      // Se não encontrou tier específico, usar o primeiro disponível
      pricePerGuest = guestTiers[0].base_price_per_adult
    }
  } else {
    // Se não há tiers, buscar preço base do serviço
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('base_price, price_per_guest')
      .eq('id', serviceId)
      .single()
    
    if (serviceError || !service) {
      throw new Error('Serviço não encontrado')
    }
    
    // Usar price_per_guest se disponível, senão usar base_price
    pricePerGuest = service.price_per_guest || service.base_price || 0
  }
  
  // 4. Buscar dados completos do serviço para usar no calculateAdvancedPrice
  const { data: fullServiceData, error: fullServiceError } = await supabase
    .from('services')
    .select(`
      *,
      service_guest_tiers (*)
    `)
    .eq('id', serviceId)
    .single()

  if (fullServiceError || !fullServiceData) {
    throw new Error('Erro ao buscar dados completos do serviço')
  }

  // 5. Usar o mesmo cálculo que está sendo usado no PartyDetailsTab.tsx
  const calculatedPrice = calculateAdvancedPrice(
    { 
      ...fullServiceData, 
      price_per_guest_at_booking: pricePerGuest 
    },
    fullGuests,
    halfGuests,
    0 // free_guests
  )
  
  // 6. Atualizar o event_service com os preços calculados
  const { error: updateError } = await supabase
    .from('event_services')
    .update({
      price_per_guest_at_booking: pricePerGuest,
      total_estimated_price: calculatedPrice // Usar o cálculo correto com taxa de 5% e Math.ceil
    })
    .eq('id', eventServiceId)
  
  if (updateError) {
    throw new Error('Erro ao atualizar preços do serviço')
  }
  
  return { pricePerGuest, totalPrice: calculatedPrice }
}

// ================================================================
// EVENT SERVICES ACTIONS
// ================================================================

export async function getEventServicesAction(filters?: {
  event_id?: string
  provider_id?: string
  booking_status?: string
  limit?: number
}): Promise<ActionResult<EventServiceWithDetails[]>> {
  try {
    const supabase = await createServerClient()
    
    let query = supabase
      .from('event_services')
      .select(`
        *,
        event:events (
          id,
          title,
          event_date,
          guest_count,
          location
        ),
        service:services (
          id,
          name,
          description,
          category,
          images_urls,
          min_guests,
          max_guests,
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
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.event_id) {
      query = query.eq('event_id', filters.event_id)
    }
    
    if (filters?.provider_id) {
      query = query.eq('provider_id', filters.provider_id)
    }
    
    if (filters?.booking_status) {
      query = query.eq('booking_status', filters.booking_status)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: eventServices, error } = await query

    if (error) {
      console.error('Error fetching event services:', error)
      return { success: false, error: 'Erro ao buscar orçamentos' }
    }

    console.log('📋 Event services encontrados:', eventServices?.length || 0)

    return { success: true, data: eventServices as EventServiceWithDetails[] }
  } catch (error) {
    console.error('Event services fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar orçamentos' 
    }
  }
}

export async function getClientEventServicesAction(): Promise<ActionResult<EventServiceWithDetails[]>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    // Buscar orçamentos dos eventos do cliente
    const { data: eventServices, error } = await supabase
      .from('event_services')
      .select(`
        *,
        event:events!inner (
          id,
          title,
          event_date,
          guest_count,
          location,
          client_id
        ),
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
      `)
      .eq('event.client_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching client event services:', error)
      return { success: false, error: 'Erro ao buscar seus orçamentos' }
    }

    return { success: true, data: eventServices as EventServiceWithDetails[] }
  } catch (error) {
    console.error('Client event services fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar seus orçamentos' 
    }
  }
}

export async function getProviderEventServicesAction(): Promise<ActionResult<EventServiceWithDetails[]>> {
  try {
    const user = await getCurrentUser()
    return getEventServicesAction({ provider_id: user.id })
  } catch (error) {
    console.error('Provider event services fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar solicitações' 
    }
  }
}

export async function createEventServiceAction(formData: FormData): Promise<ActionResult<EventService>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      event_id: formData.get('event_id') as string,
      service_id: formData.get('service_id') as string,
      client_notes: formData.get('client_notes') as string || null
    }

    const validatedData = createEventServiceSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    const { data: event } = await supabase
      .from('events')
      .select('client_id, status')
      .eq('id', validatedData.event_id)
      .single()

    if (!event || event.client_id !== user.id) {
      return { success: false, error: 'Evento não encontrado ou acesso negado' }
    }

    // Verificar se o evento não está cancelado ou completo
    if (event.status === 'cancelled' || event.status === 'completed') {
      return { success: false, error: 'Não é possível solicitar orçamentos para eventos finalizados' }
    }

    // Verificar se o serviço existe e está ativo
    const { data: service } = await supabase
      .from('services')
      .select('provider_id, is_active, status')
      .eq('id', validatedData.service_id)
      .single()

    if (!service) {
      return { success: false, error: 'Serviço não encontrado' }
    }

    if (!service.is_active || service.status !== 'active') {
      return { success: false, error: 'Serviço não está disponível' }
    }

    // Verificar se já não existe uma solicitação para este serviço no evento
    const { data: existingEventService } = await supabase
      .from('event_services')
      .select('id')
      .eq('event_id', validatedData.event_id)
      .eq('service_id', validatedData.service_id)
      .single()

    if (existingEventService) {
      return { success: false, error: 'Já existe uma solicitação para este serviço neste evento' }
    }

    const eventServiceData: EventServiceInsert = {
      ...validatedData,
      provider_id: service.provider_id,
      booking_status: 'pending_provider_approval'
    }

    const { data: eventService, error } = await supabase
      .from('event_services')
      .insert([eventServiceData])
      .select()
      .single()

    if (error) {
      console.error('Error creating event service:', error)
      return { success: false, error: 'Erro ao solicitar orçamento' }
    }

    // Calcular preços corretos usando a lógica especificada
    try {
      await calculateServicePrice(
        validatedData.event_id,
        validatedData.service_id,
        eventService.id
      )
    } catch (priceError) {
      console.error('Error calculating service price:', priceError)
      // Não falhar a criação se o cálculo de preço falhar
      // O prestador pode ajustar manualmente depois
    }

    revalidatePath('/perfil')
    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: eventService }
  } catch (error) {
    console.error('Event service creation failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao solicitar orçamento' 
    }
  }
}

export async function updateEventServiceAction(formData: FormData): Promise<ActionResult<EventService>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      id: formData.get('id') as string,
      price_per_guest_at_booking: formData.get('price_per_guest_at_booking') as string || null,
      total_estimated_price: formData.get('total_estimated_price') as string || null,
      booking_status: formData.get('booking_status') as string
    }

    const validatedData = updateEventServiceSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o event_service existe e o usuário tem permissão
    const { data: existingEventService } = await supabase
      .from('event_services')
      .select(`
        *,
        event:events (client_id)
      `)
      .eq('id', validatedData.id)
      .single()

    if (!existingEventService) {
      return { success: false, error: 'Orçamento não encontrado' }
    }

    // Verificar permissões: prestador pode editar preços e status, cliente pode editar notas
    const isProvider = existingEventService.provider_id === user.id
    const isClient = existingEventService.event.client_id === user.id

    if (!isProvider && !isClient) {
      return { success: false, error: 'Acesso negado' }
    }

    // Preparar dados de atualização baseado no tipo de usuário
    const updateData: Partial<EventServiceUpdate> = {}
    
    if (isProvider) {
      // Prestador pode atualizar preços, notas e status
      if (validatedData.price_per_guest_at_booking !== undefined) {
        updateData.price_per_guest_at_booking = validatedData.price_per_guest_at_booking
      }
      if (validatedData.total_estimated_price !== undefined) {
        updateData.total_estimated_price = validatedData.total_estimated_price
      }
      if (validatedData.booking_status !== undefined) {
        updateData.booking_status = validatedData.booking_status
      }
    }
    
    if (isClient) {
      // Cliente pode apenas atualizar suas notas
      // if (validatedData.client_notes !== undefined) { // Removed client_notes update
      //   updateData.client_notes = validatedData.client_notes
      // }
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'Nenhuma alteração foi feita' }
    }

    const { data: eventService, error } = await supabase
      .from('event_services')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event service:', error)
      return { success: false, error: 'Erro ao atualizar orçamento' }
    }

    revalidatePath('/perfil')
    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: eventService }
  } catch (error) {
    console.error('Event service update failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar orçamento' 
    }
  }
}

export async function updateEventServiceStatusAction(
  eventServiceId: string, 
  status: EventServiceStatus, 
  providerNotes?: string
): Promise<ActionResult<EventService>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o event_service existe e se o usuário tem permissão
    const { data: eventService, error: fetchError } = await supabase
      .from('event_services')
      .select(`
        id,
        event_id,
        service_id,
        provider_id,
        event:events!inner (client_id)
      `)
      .eq('id', eventServiceId)
      .single()

    if (fetchError || !eventService) {
      return { success: false, error: 'Serviço não encontrado' }
    }

    // Verificar permissões
    const isProvider = eventService.provider_id === user.id
    const isClient = (eventService.event as any).client_id === user.id

    if (!isProvider && !isClient) {
      return { success: false, error: 'Acesso negado' }
    }

    // Preparar dados de atualização
    const updateData: Partial<EventServiceUpdate> = {
      booking_status: status
    }

    // Apenas prestadores podem adicionar notas
    // if (isProvider && providerNotes) {
    //   updateData.provider_notes = providerNotes
    // }

    const { data: updatedService, error: updateError } = await supabase
      .from('event_services')
      .update(updateData)
      .eq('id', eventServiceId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating event service status:', updateError)
      return { success: false, error: 'Erro ao atualizar status' }
    }

    return { success: true, data: updatedService }
  } catch (error) {
    console.error('Update event service status failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar status' 
    }
  }
}

export async function deleteEventServiceAction(eventServiceId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o event_service existe e o usuário tem permissão
    const { data: existingEventService } = await supabase
      .from('event_services')
      .select(`
        *,
        event:events (client_id)
      `)
      .eq('id', eventServiceId)
      .single()

    if (!existingEventService) {
      return { success: false, error: 'Orçamento não encontrado' }
    }

    // Apenas o cliente pode cancelar a solicitação
    if (existingEventService.event.client_id !== user.id) {
      return { success: false, error: 'Apenas o cliente pode cancelar a solicitação' }
    }

    // Não permitir cancelamento de orçamentos já confirmados
    if (existingEventService.booking_status === 'completed') {
      return { success: false, error: 'Não é possível cancelar orçamentos já confirmados' }
    }

    const { error } = await supabase
      .from('event_services')
      .delete()
      .eq('id', eventServiceId)

    if (error) {
      console.error('Error deleting event service:', error)
      return { success: false, error: 'Erro ao cancelar solicitação' }
    }

    revalidatePath('/perfil')
    revalidatePath('/dashboard/prestador')
    
    return { success: true }
  } catch (error) {
    console.error('Event service deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao cancelar solicitação' 
    }
  }
} 

export async function recalculateServicePriceAction(eventServiceId: string): Promise<ActionResult<EventService>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o event_service existe e o usuário tem permissão
    const { data: existingEventService } = await supabase
      .from('event_services')
      .select(`
        *,
        event:events (client_id)
      `)
      .eq('id', eventServiceId)
      .single()

    if (!existingEventService) {
      return { success: false, error: 'Orçamento não encontrado' }
    }

    // Verificar permissões: prestador pode recalcular preços
    const isProvider = existingEventService.provider_id === user.id
    const isClient = existingEventService.event.client_id === user.id

    if (!isProvider && !isClient) {
      return { success: false, error: 'Acesso negado' }
    }

    // Recalcular preços usando a lógica correta
    const { pricePerGuest, totalPrice } = await calculateServicePrice(
      existingEventService.event_id,
      existingEventService.service_id,
      eventServiceId
    )

    // Buscar o event_service atualizado
    const { data: updatedEventService, error } = await supabase
      .from('event_services')
      .select()
      .eq('id', eventServiceId)
      .single()

    if (error) {
      console.error('Error fetching updated event service:', error)
      return { success: false, error: 'Erro ao buscar orçamento atualizado' }
    }

    revalidatePath('/perfil')
    revalidatePath('/dashboard/prestador')
            revalidatePath(`/perfil?tab=minhas-festas&eventId=${existingEventService.event_id}`)
    
    return { 
      success: true, 
      data: updatedEventService,
      message: `Preços recalculados: R$ ${pricePerGuest.toFixed(2)} por convidado, Total: R$ ${totalPrice.toFixed(2)}`
    }
  } catch (error) {
    console.error('Service price recalculation failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao recalcular preços' 
    }
  }
}

export async function recalculateAllEventServicesAction(eventId: string): Promise<ActionResult<{ updated: number; errors: number }>> {
  try {
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

    // Buscar todos os event_services do evento
    const { data: eventServices, error } = await supabase
      .from('event_services')
      .select('id, service_id')
      .eq('event_id', eventId)

    if (error) {
      console.error('Error fetching event services:', error)
      return { success: false, error: 'Erro ao buscar serviços do evento' }
    }

    let updated = 0
    let errors = 0

    // Recalcular preços para cada serviço
    for (const eventService of eventServices || []) {
      try {
        await calculateServicePrice(eventId, eventService.service_id, eventService.id)
        updated++
      } catch (priceError) {
        console.error(`Error calculating price for event service ${eventService.id}:`, priceError)
        errors++
      }
    }

    revalidatePath('/perfil')
    revalidatePath('/dashboard/prestador')
          revalidatePath(`/perfil?tab=minhas-festas&eventId=${eventId}`)
    
    return { 
      success: true, 
      data: { updated, errors },
      message: `Recalculados ${updated} serviços${errors > 0 ? `, ${errors} erros` : ''}`
    }
  } catch (error) {
    console.error('All services price recalculation failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao recalcular preços' 
    }
  }
}