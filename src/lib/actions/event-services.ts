'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { EventService, EventServiceInsert, EventServiceUpdate, EventServiceWithDetails } from '@/types/database'

// Validation schemas
const createEventServiceSchema = z.object({
  event_id: z.string().uuid('ID do evento inválido'),
  service_id: z.string().uuid('ID do serviço inválido'),
  client_notes: z.string().max(500, 'Notas do cliente devem ter no máximo 500 caracteres').optional().nullable()
})

const updateEventServiceSchema = z.object({
  id: z.string().uuid('ID inválido'),
  price_per_guest_at_booking: z.coerce.number().min(0, 'Preço por convidado deve ser maior ou igual a 0').optional().nullable(),
  befest_fee_at_booking: z.coerce.number().min(0, 'Taxa deve ser maior ou igual a 0').optional().nullable(),
  total_estimated_price: z.coerce.number().min(0, 'Preço total deve ser maior ou igual a 0').optional().nullable(),
  provider_notes: z.string().max(500, 'Notas do prestador devem ter no máximo 500 caracteres').optional().nullable(),
  client_notes: z.string().max(500, 'Notas do cliente devem ter no máximo 500 caracteres').optional().nullable(),
  booking_status: z.enum(['pending', 'waiting_payment', 'confirmed', 'rejected', 'cancelled']).optional()
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
          location,
          client_id
        ),
        service:services (
          *,
          provider:users!services_provider_id_fkey (
            id,
            full_name,
            organization_name,
            logo_url,
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
            logo_url,
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
      booking_status: 'pending'
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

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${validatedData.event_id}`)
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
      befest_fee_at_booking: formData.get('befest_fee_at_booking') as string || null,
      total_estimated_price: formData.get('total_estimated_price') as string || null,
      provider_notes: formData.get('provider_notes') as string || null,
      client_notes: formData.get('client_notes') as string || null,
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
      if (validatedData.befest_fee_at_booking !== undefined) {
        updateData.befest_fee_at_booking = validatedData.befest_fee_at_booking
      }
      if (validatedData.total_estimated_price !== undefined) {
        updateData.total_estimated_price = validatedData.total_estimated_price
      }
      if (validatedData.provider_notes !== undefined) {
        updateData.provider_notes = validatedData.provider_notes
      }
      if (validatedData.booking_status !== undefined) {
        updateData.booking_status = validatedData.booking_status
      }
    }
    
    if (isClient) {
      // Cliente pode apenas atualizar suas notas
      if (validatedData.client_notes !== undefined) {
        updateData.client_notes = validatedData.client_notes
      }
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

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${existingEventService.event_id}`)
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
  status: string, 
  providerNotes?: string
): Promise<ActionResult<EventService>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o event_service pertence ao prestador
    const { data: existingEventService } = await supabase
      .from('event_services')
      .select('provider_id, booking_status, event_id')
      .eq('id', eventServiceId)
      .single()

    if (!existingEventService || existingEventService.provider_id !== user.id) {
      return { success: false, error: 'Orçamento não encontrado ou acesso negado' }
    }

    // Validar transições de status
    const validTransitions: Record<string, string[]> = {
      'pending': ['waiting_payment', 'rejected'],
      'waiting_payment': ['confirmed'],
      'confirmed': ['cancelled'],
      'rejected': [],
      'cancelled': []
    }

    const allowedStatuses = validTransitions[existingEventService.booking_status] || []
    if (!allowedStatuses.includes(status)) {
      return { success: false, error: 'Transição de status inválida' }
    }

    const updateData: Partial<EventServiceUpdate> = {
      booking_status: status as any
    }

    if (providerNotes) {
      updateData.provider_notes = providerNotes
    }

    const { data: eventService, error } = await supabase
      .from('event_services')
      .update(updateData)
      .eq('id', eventServiceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating event service status:', error)
      return { success: false, error: 'Erro ao atualizar status do orçamento' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${existingEventService.event_id}`)
    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: eventService }
  } catch (error) {
    console.error('Event service status update failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar status do orçamento' 
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
    if (existingEventService.booking_status === 'confirmed') {
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

    revalidatePath('/minhas-festas')
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