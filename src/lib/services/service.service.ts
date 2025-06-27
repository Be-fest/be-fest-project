import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { BaseService } from './base.service'
import { Service, ProviderProfile } from '@/types/database'

export class ServiceService extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'services')
  }

  async createService(data: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    return this.create<Service, typeof data>(data)
  }

  async updateService(id: string, data: Partial<Omit<Service, 'id' | 'provider_id' | 'created_at' | 'updated_at'>>) {
    return this.update<Service, typeof data>(id, data)
  }

  async getProviderServices(providerId: string, status?: Service['status']) {
    const query = {
      filters: {
        provider_id: providerId,
        ...(status && { status })
      }
    }
    return this.getAll<Service>(query)
  }

  async getServiceWithProvider(id: string): Promise<(Service & { provider: ProviderProfile }) | null> {
    return this.handleError(
      this.supabase
        .from('services')
        .select(`
          *,
          provider:provider_profiles (*)
        `)
        .eq('id', id)
        .single()
    )
  }

  async searchServices(params: {
    category?: string
    minPrice?: number
    maxPrice?: number
    minGuests?: number
    maxGuests?: number
    query?: string
    status?: Service['status']
  }) {
    let query = this.supabase
      .from('services')
      .select(`
        *,
        provider:provider_profiles (*)
      `)
      .eq('status', params.status || 'active')

    if (params.category) {
      query = query.eq('category', params.category)
    }

    if (params.minPrice) {
      query = query.gte('base_price', params.minPrice)
    }

    if (params.maxPrice) {
      query = query.lte('base_price', params.maxPrice)
    }

    if (params.minGuests) {
      query = query.gte('min_guests', params.minGuests)
    }

    if (params.maxGuests) {
      query = query.or(`max_guests.gte.${params.maxGuests},max_guests.is.null`)
    }

    if (params.query) {
      query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`)
    }

    return this.handleError<(Service & { provider: ProviderProfile })[]>(query)
  }

  async getServicesByCategory(category: string) {
    return this.handleError<(Service & { provider: ProviderProfile })[]>(
      this.supabase
        .from('services')
        .select(`
          *,
          provider:provider_profiles (*)
        `)
        .eq('category', category)
        .eq('status', 'active')
    )
  }

  async getPopularServices(limit = 10) {
    // This is a placeholder implementation
    // In a real application, you would want to calculate popularity based on bookings, ratings, etc.
    return this.handleError<(Service & { provider: ProviderProfile })[]>(
      this.supabase
        .from('services')
        .select(`
          *,
          provider:provider_profiles (*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)
    )
  }

  async toggleServiceStatus(id: string, status: Service['status']) {
    return this.update<Service, { status: Service['status'] }>(id, { status })
  }
} 