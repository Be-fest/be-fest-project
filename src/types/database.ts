export type UserRole = 'client' | 'provider' | 'admin'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type ServiceStatus = 'active' | 'inactive'
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'
export type EventServiceStatus = 'pending_provider_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled'

export interface User {
  id: string
  role: UserRole
  full_name: string | null
  email: string | null
  organization_name: string | null
  cnpj: string | null
  cpf: string | null
  whatsapp_number: string | null
  logo_url: string | null
  area_of_operation: string | null
  coordenates: any | null
  created_at: string
  updated_at: string
}

export interface ProviderProfile {
  id: string
  business_name: string
  description: string | null
  category: string | null
  address: string | null
  city: string | null
  state: string | null
  cnpj: string | null
  logo_url: string | null
  area_of_operation: string | null
  rating: number
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  client_id: string
  title: string
  description: string | null
  event_date: string
  start_time: string | null
  location: string | null
  guest_count: number
  budget: number | null
  status: EventStatus
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  provider_id: string
  name: string
  description: string | null
  category: string
  images_urls: string[] | null
  base_price: number
  price_per_guest: number | null
  min_guests: number
  max_guests: number | null
  status: ServiceStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  event_id: string
  service_id: string
  status: BookingStatus
  price: number
  guest_count: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  icon_url: string | null
  created_at: string
  updated_at: string
}

export interface EventService {
  id: string
  event_id: string
  service_id: string
  provider_id: string
  price_per_guest_at_booking: number | null
  befest_fee_at_booking: number | null
  total_estimated_price: number | null
  provider_notes: string | null
  client_notes: string | null
  booking_status: EventServiceStatus
  created_at: string
  updated_at: string
}

export interface ServiceGuestTier {
  id: string
  service_id: string
  min_total_guests: number
  max_total_guests: number | null
  base_price_per_adult: number
  tier_description: string | null
  created_at: string
  updated_at: string
}

export interface ServiceAgePricingRule {
  id: string
  service_id: string
  rule_description: string
  age_min_years: number
  age_max_years: number | null
  pricing_method: 'fixed' | 'percentage'
  value: number
  created_at: string
  updated_at: string
}

export interface ServiceDateSurcharge {
  id: string
  service_id: string
  surcharge_description: string
  start_date: string
  end_date: string
  surcharge_type: 'fixed' | 'percentage'
  surcharge_value: number
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      provider_profiles: {
        Row: ProviderProfile
        Insert: Omit<ProviderProfile, 'created_at' | 'updated_at' | 'rating'>
        Update: Partial<Omit<ProviderProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Event, 'id' | 'client_id' | 'created_at' | 'updated_at'>>
      }
      services: {
        Row: Service
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Service, 'id' | 'provider_id' | 'created_at' | 'updated_at'>>
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Booking, 'id' | 'event_id' | 'service_id' | 'created_at' | 'updated_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
      }
      subcategories: {
        Row: Subcategory
        Insert: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>>
      }
      event_services: {
        Row: EventService
        Insert: Omit<EventService, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<EventService, 'id' | 'created_at' | 'updated_at'>>
      }
      service_guest_tiers: {
        Row: ServiceGuestTier
        Insert: Omit<ServiceGuestTier, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ServiceGuestTier, 'id' | 'created_at' | 'updated_at'>>
      }
      service_age_pricing_rules: {
        Row: ServiceAgePricingRule
        Insert: Omit<ServiceAgePricingRule, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ServiceAgePricingRule, 'id' | 'created_at' | 'updated_at'>>
      }
      service_date_surcharges: {
        Row: ServiceDateSurcharge
        Insert: Omit<ServiceDateSurcharge, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ServiceDateSurcharge, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      user_role: UserRole
      event_status: EventStatus
      service_status: ServiceStatus
      booking_status: BookingStatus
      event_service_status: EventServiceStatus
    }
  }
} 