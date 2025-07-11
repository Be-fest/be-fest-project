'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { Booking, BookingInsert, BookingUpdate, BookingWithDetails } from '@/types/database'

// Validation schemas
const createBookingSchema = z.object({
  event_id: z.string().uuid('ID do evento inválido'),
  service_id: z.string().uuid('ID do serviço inválido'),
  price: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
  guest_count: z.coerce.number().min(1, 'Número de convidados deve ser maior que 0'),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional().nullable()
})

const updateBookingSchema = z.object({
  id: z.string().uuid('ID inválido'),
  status: z.enum(['pending', 'confirmed', 'paid', 'completed', 'cancelled']).optional(),
  price: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0').optional(),
  guest_count: z.coerce.number().min(1, 'Número de convidados deve ser maior que 0').optional(),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional().nullable()
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
// BOOKINGS ACTIONS
// ================================================================

export async function getBookingsAction(filters?: {
  event_id?: string
  service_id?: string
  status?: string
  limit?: number
}): Promise<ActionResult<BookingWithDetails[]>> {
  try {
    const supabase = await createServerClient()
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        event:events (
          id,
          title,
          event_date,
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
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.event_id) {
      query = query.eq('event_id', filters.event_id)
    }
    
    if (filters?.service_id) {
      query = query.eq('service_id', filters.service_id)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error('Error fetching bookings:', error)
      return { success: false, error: 'Erro ao buscar reservas' }
    }

    return { success: true, data: bookings as BookingWithDetails[] }
  } catch (error) {
    console.error('Bookings fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar reservas' 
    }
  }
}

export async function getClientBookingsAction(): Promise<ActionResult<BookingWithDetails[]>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    // Buscar bookings dos eventos do cliente
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        event:events!inner (
          id,
          title,
          event_date,
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
        )
      `)
      .eq('event.client_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching client bookings:', error)
      return { success: false, error: 'Erro ao buscar suas reservas' }
    }

    return { success: true, data: bookings as BookingWithDetails[] }
  } catch (error) {
    console.error('Client bookings fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar suas reservas' 
    }
  }
}

export async function getProviderBookingsAction(): Promise<ActionResult<BookingWithDetails[]>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    // Buscar bookings dos serviços do prestador
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        event:events (
          id,
          title,
          event_date,
          location,
          client_id
        ),
        service:services!inner (
          *,
          provider:users!services_provider_id_fkey (
            id,
            full_name,
            organization_name,
            logo_url,
            area_of_operation
          )
        )
      `)
      .eq('service.provider_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching provider bookings:', error)
      return { success: false, error: 'Erro ao buscar reservas dos seus serviços' }
    }

    return { success: true, data: bookings as BookingWithDetails[] }
  } catch (error) {
    console.error('Provider bookings fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar reservas dos seus serviços' 
    }
  }
}

export async function createBookingAction(formData: FormData): Promise<ActionResult<Booking>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      event_id: formData.get('event_id') as string,
      service_id: formData.get('service_id') as string,
      price: formData.get('price') as string,
      guest_count: formData.get('guest_count') as string,
      notes: formData.get('notes') as string || null
    }

    const validatedData = createBookingSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    const { data: event } = await supabase
      .from('events')
      .select('client_id, status, guest_count')
      .eq('id', validatedData.event_id)
      .single()

    if (!event || event.client_id !== user.id) {
      return { success: false, error: 'Evento não encontrado ou acesso negado' }
    }

    // Verificar se o evento está publicado
    if (event.status !== 'published') {
      return { success: false, error: 'Apenas eventos publicados podem ter reservas finalizadas' }
    }

    // Verificar se existe um event_service aprovado para este serviço
    const { data: eventService } = await supabase
      .from('event_services')
      .select('id, booking_status')
      .eq('event_id', validatedData.event_id)
      .eq('service_id', validatedData.service_id)
      .eq('booking_status', 'approved')
      .single()

    if (!eventService) {
      return { success: false, error: 'Serviço deve estar aprovado antes de criar uma reserva' }
    }

    // Verificar se já não existe uma reserva para este serviço no evento
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('event_id', validatedData.event_id)
      .eq('service_id', validatedData.service_id)
      .single()

    if (existingBooking) {
      return { success: false, error: 'Já existe uma reserva para este serviço neste evento' }
    }

    // Verificar se o número de convidados não excede o do evento
    if (validatedData.guest_count > event.guest_count) {
      return { success: false, error: 'Número de convidados da reserva não pode exceder o do evento' }
    }

    const bookingData: BookingInsert = {
      ...validatedData,
      status: 'pending'
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      return { success: false, error: 'Erro ao criar reserva' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${validatedData.event_id}`)
    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: booking }
  } catch (error) {
    console.error('Booking creation failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar reserva' 
    }
  }
}

export async function updateBookingAction(formData: FormData): Promise<ActionResult<Booking>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      id: formData.get('id') as string,
      status: formData.get('status') as string,
      price: formData.get('price') as string,
      guest_count: formData.get('guest_count') as string,
      notes: formData.get('notes') as string || null
    }

    const validatedData = updateBookingSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se a reserva existe e o usuário tem permissão
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select(`
        *,
        event:events (client_id),
        service:services (provider_id)
      `)
      .eq('id', validatedData.id)
      .single()

    if (!existingBooking) {
      return { success: false, error: 'Reserva não encontrada' }
    }

    // Verificar permissões
    const isClient = existingBooking.event.client_id === user.id
    const isProvider = existingBooking.service.provider_id === user.id

    if (!isClient && !isProvider) {
      return { success: false, error: 'Acesso negado' }
    }

    // Validar transições de status
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    }

    if (validatedData.status) {
      const allowedStatuses = validTransitions[existingBooking.status] || []
      if (!allowedStatuses.includes(validatedData.status)) {
        return { success: false, error: 'Transição de status inválida' }
      }
    }

    // Preparar dados de atualização
    const updateData: Partial<BookingUpdate> = {}
    
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }
    if (validatedData.price !== undefined) {
      updateData.price = validatedData.price
    }
    if (validatedData.guest_count !== undefined) {
      updateData.guest_count = validatedData.guest_count
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes === null ? undefined : validatedData.notes
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'Nenhuma alteração foi feita' }
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking:', error)
      return { success: false, error: 'Erro ao atualizar reserva' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${existingBooking.event_id}`)
    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: booking }
  } catch (error) {
    console.error('Booking update failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar reserva' 
    }
  }
}

export async function updateBookingStatusAction(
  bookingId: string, 
  status: string
): Promise<ActionResult<Booking>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se a reserva existe e o usuário tem permissão
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select(`
        *,
        event:events (client_id),
        service:services (provider_id)
      `)
      .eq('id', bookingId)
      .single()

    if (!existingBooking) {
      return { success: false, error: 'Reserva não encontrada' }
    }

    // Verificar permissões
    const isClient = existingBooking.event.client_id === user.id
    const isProvider = existingBooking.service.provider_id === user.id

    if (!isClient && !isProvider) {
      return { success: false, error: 'Acesso negado' }
    }

    // Validar transições de status
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    }

    const allowedStatuses = validTransitions[existingBooking.status] || []
    if (!allowedStatuses.includes(status)) {
      return { success: false, error: 'Transição de status inválida' }
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Error updating booking status:', error)
      return { success: false, error: 'Erro ao atualizar status da reserva' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${existingBooking.event_id}`)
    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: booking }
  } catch (error) {
    console.error('Booking status update failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar status da reserva' 
    }
  }
}

export async function deleteBookingAction(bookingId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se a reserva existe e o usuário tem permissão
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select(`
        *,
        event:events (client_id)
      `)
      .eq('id', bookingId)
      .single()

    if (!existingBooking) {
      return { success: false, error: 'Reserva não encontrada' }
    }

    // Apenas o cliente pode cancelar a reserva
    if (existingBooking.event.client_id !== user.id) {
      return { success: false, error: 'Apenas o cliente pode cancelar a reserva' }
    }

    // Não permitir cancelamento de reservas já completas
    if (existingBooking.status === 'completed') {
      return { success: false, error: 'Não é possível cancelar reservas já completas' }
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      console.error('Error deleting booking:', error)
      return { success: false, error: 'Erro ao cancelar reserva' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath('/dashboard/prestador')
    
    return { success: true }
  } catch (error) {
    console.error('Booking deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao cancelar reserva' 
    }
  }
}

// ================================================================
// UTILITY ACTIONS
// ================================================================

export async function createBookingFromEventServiceAction(eventServiceId: string): Promise<ActionResult<Booking>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Buscar o event_service aprovado
    const { data: eventService } = await supabase
      .from('event_services')
      .select(`
        *,
        event:events (id, client_id, guest_count, status),
        service:services (id)
      `)
      .eq('id', eventServiceId)
      .eq('booking_status', 'approved')
      .single()

    if (!eventService) {
      return { success: false, error: 'Orçamento aprovado não encontrado' }
    }

    // Verificar se o usuário é o cliente do evento
    if (eventService.event.client_id !== user.id) {
      return { success: false, error: 'Acesso negado' }
    }

    // Verificar se o evento está publicado
    if (eventService.event.status !== 'published') {
      return { success: false, error: 'Evento deve estar publicado para criar reservas' }
    }

    // Criar a reserva automaticamente
    const formData = new FormData()
    formData.append('event_id', eventService.event_id)
    formData.append('service_id', eventService.service_id)
    formData.append('price', (eventService.total_estimated_price || 0).toString())
    formData.append('guest_count', eventService.event.guest_count.toString())
    
    if (eventService.provider_notes) {
      formData.append('notes', eventService.provider_notes)
    }

    return createBookingAction(formData)
  } catch (error) {
    console.error('Booking from event service creation failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar reserva a partir do orçamento' 
    }
  }
} 