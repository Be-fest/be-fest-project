import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { BaseService } from './base.service'
import { Event, Booking, Service } from '@/types/database'

export class EventService extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'events')
  }

  async createEvent(data: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    return this.create<Event, typeof data>(data)
  }

  async updateEvent(id: string, data: Partial<Omit<Event, 'id' | 'client_id' | 'created_at' | 'updated_at'>>) {
    return this.update<Event, typeof data>(id, data)
  }

  async getClientEvents(clientId: string, status?: Event['status']) {
    const query = {
      filters: {
        client_id: clientId,
        ...(status && { status })
      }
    }
    return this.getAll<Event>(query)
  }

  async getEventWithBookings(id: string): Promise<(Event & { bookings: (Booking & { service: Service })[] }) | null> {
    return this.handleError(
      this.supabase
        .from('events')
        .select(`
          *,
          bookings:bookings (
            *,
            service:services (*)
          )
        `)
        .eq('id', id)
        .single()
    )
  }

  async createBooking(data: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
    return this.handleError<Booking>(
      this.supabase
        .from('bookings')
        .insert(data)
        .select()
        .single()
    )
  }

  async updateBookingStatus(id: string, status: Booking['status']) {
    return this.handleError<Booking>(
      this.supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
    )
  }

  async getProviderBookings(providerId: string, status?: Booking['status']) {
    let query = this.supabase
      .from('bookings')
      .select(`
        *,
        event:events (*),
        service:services (*)
      `)
      .eq('service.provider_id', providerId)

    if (status) {
      query = query.eq('status', status)
    }

    return this.handleError<(Booking & { event: Event; service: Service })[]>(query)
  }

  async getEventBookings(eventId: string) {
    return this.handleError<(Booking & { service: Service })[]>(
      this.supabase
        .from('bookings')
        .select(`
          *,
          service:services (*)
        `)
        .eq('event_id', eventId)
    )
  }

  async calculateEventTotal(eventId: string): Promise<number> {
    const bookings = await this.getEventBookings(eventId)
    return bookings?.reduce((total, booking) => total + booking.price, 0) || 0
  }

  async deleteBooking(id: string) {
    return this.handleError<null>(
      this.supabase
        .from('bookings')
        .delete()
        .eq('id', id)
    )
  }
} 