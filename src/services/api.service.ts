import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  role: 'client' | 'provider' | 'admin'
  full_name?: string
  email?: string
  organization_name?: string
  cnpj?: string
  whatsapp_number?: string
  profile_image?: string
  area_of_operation?: string
  created_at: string
  updated_at: string
}

interface Service {
  id: string
  provider_id: string
  name: string
  description?: string
  category: string
  images_urls?: string[]
  price_per_guest?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Event {
  id: string
  client_id: string
  event_name: string
  event_date: string
  start_time: string
  location_address: string
  number_of_guests?: number
  observations?: string
  created_at: string
  updated_at: string
}

interface EventService {
  id: string
  event_id: string
  service_id: string
  provider_id: string
  price_per_guest_at_booking: number
  befest_fee_at_booking: number
  total_estimated_price: number
  booking_status: string
  provider_notes?: string
  client_notes?: string
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

interface Subcategory {
  id: string
  category_id: string
  name: string
  icon_url?: string
  created_at: string
  updated_at: string
}

interface ServiceGuestTier {
  id: string
  service_id: string
  min_total_guests: number
  max_total_guests?: number
  base_price_per_adult: number
  tier_description?: string
  created_at: string
  updated_at: string
}

interface ServiceAgePricingRule {
  id: string
  service_id: string
  rule_description: string
  age_min_years: number
  age_max_years?: number
  pricing_method: string
  value: number
  created_at: string
  updated_at: string
}

interface ServiceDateSurcharge {
  id: string
  service_id: string
  surcharge_description: string
  start_date: string
  end_date: string
  surcharge_type: string
  surcharge_value: number
  created_at: string
  updated_at: string
}

interface ServiceWithProvider extends Service {
  provider: UserProfile
}

interface EventWithDetails extends Event {
  client: UserProfile
  event_services: (EventService & {
    service: ServiceWithProvider
    provider: UserProfile
  })[]
}

export class ApiService {
  async getProviders(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'provider')
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  async getProviderById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'provider')
      .single()

    if (error) {
      console.error('Error fetching provider:', error)
      return null
    }

    return data
  }

  async getServicesByProvider(providerId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  async getServicesWithProviders(): Promise<ServiceWithProvider[]> {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:users(*)
      `)
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  async getSubcategories(categoryId?: string): Promise<Subcategory[]> {
    let query = supabase
      .from('subcategories')
      .select(`
        *,
        category:categories(*)
      `)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query.order('name')

    if (error) throw error
    return data || []
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createEventService(eventServiceData: Partial<EventService>): Promise<EventService> {
    const { data, error } = await supabase
      .from('event_services')
      .insert(eventServiceData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getEventsByClient(clientId: string): Promise<EventWithDetails[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        client:users(*),
        event_services(
          *,
          service:services(*),
          provider:users(*)
        )
      `)
      .eq('client_id', clientId)
      .order('event_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getEventsByProvider(providerId: string): Promise<EventWithDetails[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        client:users(*),
        event_services!inner(
          *,
          service:services(*),
          provider:users(*)
        )
      `)
      .eq('event_services.provider_id', providerId)
      .order('event_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getServiceGuestTiers(serviceId: string): Promise<ServiceGuestTier[]> {
    const { data, error } = await supabase
      .from('service_guest_tiers')
      .select('*')
      .eq('service_id', serviceId)
      .order('min_total_guests')

    if (error) throw error
    return data || []
  }

  async getServiceAgePricingRules(serviceId: string): Promise<ServiceAgePricingRule[]> {
    const { data, error } = await supabase
      .from('service_age_pricing_rules')
      .select('*')
      .eq('service_id', serviceId)
      .order('age_min_years')

    if (error) throw error
    return data || []
  }

  async getServiceDateSurcharges(serviceId: string): Promise<ServiceDateSurcharge[]> {
    const { data, error } = await supabase
      .from('service_date_surcharges')
      .select('*')
      .eq('service_id', serviceId)
      .order('start_date')

    if (error) throw error
    return data || []
  }

  async updateEventServiceStatus(
    eventServiceId: string, 
    status: string, 
    notes?: string
  ): Promise<EventService> {
    const updateData: any = { booking_status: status }
    if (notes) updateData.provider_notes = notes

    const { data, error } = await supabase
      .from('event_services')
      .update(updateData)
      .eq('id', eventServiceId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createService(serviceData: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteService(serviceId: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', serviceId)

    if (error) throw error
  }
}
