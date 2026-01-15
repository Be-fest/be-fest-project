'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { EventServiceWithDetails } from '@/types/database'
import { startOfWeek, endOfWeek, addDays, format, startOfMonth, endOfMonth } from 'date-fns'

// Result types
type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
  message?: string
}

// Helper function to get current user
async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  return user
}

// Interface for agenda event with full details
export interface AgendaEvent {
  id: string
  event_service_id: string
  event_id: string
  event_title: string
  event_date: string
  event_location: string | null
  guest_count: number
  service_name: string
  service_id: string
  provider_id: string
  provider_name: string | null
  client_id: string
  client_name: string | null
  client_email: string | null
  booking_status: string
  total_estimated_price: number | null
  can_chat: boolean
}

/**
 * Get events for the agenda by week
 * @param weekStartDate - ISO date string for the start of the week
 * @param providerId - Optional provider ID to filter events (for provider role)
 */
export async function getAgendaEventsByWeekAction(weekStartDate: string, providerId?: string): Promise<ActionResult<AgendaEvent[]>> {
  try {
    const supabase = await createServerClient()

    const weekStart = new Date(weekStartDate)
    const weekEnd = addDays(weekStart, 6)
    const weekStartStr = format(weekStart, 'yyyy-MM-dd')
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd')

    // Build query with optional provider filter
    let query = supabase
      .from('event_services')
      .select(`
        id,
        event_id,
        service_id,
        provider_id,
        booking_status,
        total_estimated_price,
        event:events (
          id,
          title,
          event_date,
          location,
          guest_count,
          client_id
        ),
        service:services (
          id,
          name
        ),
        provider:users!event_services_provider_id_fkey (
          id,
          full_name,
          organization_name
        )
      `)

    // Filter by provider if providerId is specified
    if (providerId) {
      query = query.eq('provider_id', providerId)
    }

    const { data: eventServices, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agenda events:', error)
      return { success: false, error: 'Erro ao buscar eventos da agenda' }
    }

    // Filter by date range and transform data
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const agendaEvents: AgendaEvent[] = []

    for (const es of eventServices || []) {
      // Skip if no event data
      if (!es.event || !es.service) continue

      const event = es.event as any
      const service = es.service as any
      const provider = es.provider as any

      // Filter by date range
      const eventDateStr = event.event_date
      if (eventDateStr < weekStartStr || eventDateStr > weekEndStr) continue

      // Get client info
      const { data: client } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', event.client_id)
        .single()

      const eventDate = new Date(event.event_date)
      eventDate.setHours(0, 0, 0, 0)

      const isPaidStatus = ['approved', 'waiting_payment', 'in_progress'].includes(es.booking_status)
      const isBeforeEventDate = eventDate >= today
      const canChat = isPaidStatus && isBeforeEventDate

      agendaEvents.push({
        id: es.id,
        event_service_id: es.id,
        event_id: event.id,
        event_title: event.title,
        event_date: event.event_date,
        event_location: event.location,
        guest_count: event.guest_count || 0,
        service_name: service.name,
        service_id: service.id,
        provider_id: es.provider_id,
        provider_name: provider?.organization_name || provider?.full_name || null,
        client_id: event.client_id,
        client_name: client?.full_name || null,
        client_email: client?.email || null,
        booking_status: es.booking_status,
        total_estimated_price: es.total_estimated_price,
        can_chat: canChat
      })
    }

    // Sort by event date
    agendaEvents.sort((a, b) => a.event_date.localeCompare(b.event_date))

    return { success: true, data: agendaEvents }
  } catch (error) {
    console.error('Agenda events fetch failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar eventos da agenda'
    }
  }
}

/**
 * Get events for the agenda by month
 * @param year - Year number
 * @param month - Month number (1-12)
 * @param providerId - Optional provider ID to filter events (for provider role)
 */
export async function getAgendaEventsByMonthAction(year: number, month: number, providerId?: string): Promise<ActionResult<AgendaEvent[]>> {
  try {
    const supabase = await createServerClient()

    const monthStart = startOfMonth(new Date(year, month - 1))
    const monthEnd = endOfMonth(new Date(year, month - 1))

    let query = supabase
      .from('event_services')
      .select(`
        id,
        event_id,
        service_id,
        provider_id,
        booking_status,
        total_estimated_price,
        event:events!inner (
          id,
          title,
          event_date,
          location,
          guest_count,
          client_id,
          client:users!events_client_id_fkey (
            id,
            full_name,
            email
          )
        ),
        service:services!inner (
          id,
          name
        ),
        provider:users!event_services_provider_id_fkey (
          id,
          full_name,
          organization_name
        )
      `)
      .gte('event.event_date', format(monthStart, 'yyyy-MM-dd'))
      .lte('event.event_date', format(monthEnd, 'yyyy-MM-dd'))

    // Filter by provider if providerId is specified
    if (providerId) {
      query = query.eq('provider_id', providerId)
    }

    const { data: eventServices, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agenda events by month:', error)
      return { success: false, error: 'Erro ao buscar eventos do mês' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Transform data to AgendaEvent format
    const agendaEvents: AgendaEvent[] = (eventServices || []).map((es: any) => {
      const eventDate = new Date(es.event.event_date)
      eventDate.setHours(0, 0, 0, 0)

      const isPaidStatus = ['approved', 'waiting_payment', 'in_progress'].includes(es.booking_status)
      const isBeforeEventDate = eventDate >= today
      const canChat = isPaidStatus && isBeforeEventDate

      return {
        id: es.id,
        event_service_id: es.id,
        event_id: es.event.id,
        event_title: es.event.title,
        event_date: es.event.event_date,
        event_location: es.event.location,
        guest_count: es.event.guest_count,
        service_name: es.service.name,
        service_id: es.service.id,
        provider_id: es.provider_id,
        provider_name: es.provider?.organization_name || es.provider?.full_name || null,
        client_id: es.event.client.id,
        client_name: es.event.client.full_name,
        client_email: es.event.client.email,
        booking_status: es.booking_status,
        total_estimated_price: es.total_estimated_price,
        can_chat: canChat
      }
    })

    return { success: true, data: agendaEvents }
  } catch (error) {
    console.error('Agenda events by month fetch failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar eventos do mês'
    }
  }
}

/**
 * Get a single event service with details for the agenda
 */
export async function getAgendaEventDetailAction(eventServiceId: string): Promise<ActionResult<AgendaEvent>> {
  try {
    const supabase = await createServerClient()

    const { data: es, error } = await supabase
      .from('event_services')
      .select(`
        id,
        event_id,
        service_id,
        provider_id,
        booking_status,
        total_estimated_price,
        event:events!inner (
          id,
          title,
          event_date,
          location,
          guest_count,
          client_id,
          client:users!events_client_id_fkey (
            id,
            full_name,
            email
          )
        ),
        service:services!inner (
          id,
          name
        ),
        provider:users!event_services_provider_id_fkey (
          id,
          full_name,
          organization_name
        )
      `)
      .eq('id', eventServiceId)
      .single()

    if (error || !es) {
      console.error('Error fetching event detail:', error)
      return { success: false, error: 'Evento não encontrado' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date((es.event as any).event_date)
    eventDate.setHours(0, 0, 0, 0)

    const isPaidStatus = ['approved', 'waiting_payment', 'in_progress'].includes(es.booking_status)
    const isBeforeEventDate = eventDate >= today
    const canChat = isPaidStatus && isBeforeEventDate

    const agendaEvent: AgendaEvent = {
      id: es.id,
      event_service_id: es.id,
      event_id: (es.event as any).id,
      event_title: (es.event as any).title,
      event_date: (es.event as any).event_date,
      event_location: (es.event as any).location,
      guest_count: (es.event as any).guest_count,
      service_name: (es.service as any).name,
      service_id: (es.service as any).id,
      provider_id: es.provider_id,
      provider_name: (es.provider as any)?.organization_name || (es.provider as any)?.full_name || null,
      client_id: (es.event as any).client.id,
      client_name: (es.event as any).client.full_name,
      client_email: (es.event as any).client.email,
      booking_status: es.booking_status,
      total_estimated_price: es.total_estimated_price,
      can_chat: canChat
    }

    return { success: true, data: agendaEvent }
  } catch (error) {
    console.error('Event detail fetch failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar detalhes do evento'
    }
  }
}
