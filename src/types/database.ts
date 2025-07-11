export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type UserRole = 'client' | 'provider' | 'admin'
export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled' | 'waiting_payment' | null
export type ServiceStatus = 'active' | 'inactive' | 'pending_approval'
export type EventServiceStatus = 'pending_provider_approval' | 'approved' | 'rejected' | 'cancelled'
export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled'
export type PricingMethod = 'fixed' | 'percentage'
export type SurchargeType = 'fixed' | 'percentage'

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
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
          coordenates: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          email?: string | null
          organization_name?: string | null
          cnpj?: string | null
          cpf?: string | null
          whatsapp_number?: string | null
          logo_url?: string | null
          area_of_operation?: string | null
          coordenates?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string | null
          email?: string | null
          organization_name?: string | null
          cnpj?: string | null
          cpf?: string | null
          whatsapp_number?: string | null
          logo_url?: string | null
          area_of_operation?: string | null
          coordenates?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          name: string
          icon_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          icon_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          icon_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
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
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          event_date: string
          start_time?: string | null
          location?: string | null
          guest_count?: number
          budget?: number | null
          status?: EventStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          event_date?: string
          start_time?: string | null
          location?: string | null
          guest_count?: number
          budget?: number | null
          status?: EventStatus
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
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
        Insert: {
          id?: string
          provider_id: string
          name: string
          description?: string | null
          category: string
          images_urls?: string[] | null
          base_price: number
          price_per_guest?: number | null
          min_guests?: number
          max_guests?: number | null
          status?: ServiceStatus
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          name?: string
          description?: string | null
          category?: string
          images_urls?: string[] | null
          base_price?: number
          price_per_guest?: number | null
          min_guests?: number
          max_guests?: number | null
          status?: ServiceStatus
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_guest_tiers: {
        Row: {
          id: string
          service_id: string
          min_total_guests: number
          max_total_guests: number | null
          base_price_per_adult: number
          tier_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          min_total_guests: number
          max_total_guests?: number | null
          base_price_per_adult: number
          tier_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          min_total_guests?: number
          max_total_guests?: number | null
          base_price_per_adult?: number
          tier_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_age_pricing_rules: {
        Row: {
          id: string
          service_id: string
          rule_description: string
          age_min_years: number
          age_max_years: number | null
          pricing_method: PricingMethod
          value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          rule_description: string
          age_min_years: number
          age_max_years?: number | null
          pricing_method: PricingMethod
          value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          rule_description?: string
          age_min_years?: number
          age_max_years?: number | null
          pricing_method?: PricingMethod
          value?: number
          created_at?: string
          updated_at?: string
        }
      }
      service_date_surcharges: {
        Row: {
          id: string
          service_id: string
          surcharge_description: string
          start_date: string
          end_date: string
          surcharge_type: SurchargeType
          surcharge_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          surcharge_description: string
          start_date: string
          end_date: string
          surcharge_type: SurchargeType
          surcharge_value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          surcharge_description?: string
          start_date?: string
          end_date?: string
          surcharge_type?: SurchargeType
          surcharge_value?: number
          created_at?: string
          updated_at?: string
        }
      }
      event_services: {
        Row: {
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
        Insert: {
          id?: string
          event_id: string
          service_id: string
          provider_id: string
          price_per_guest_at_booking?: number | null
          befest_fee_at_booking?: number | null
          total_estimated_price?: number | null
          provider_notes?: string | null
          client_notes?: string | null
          booking_status?: EventServiceStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          service_id?: string
          provider_id?: string
          price_per_guest_at_booking?: number | null
          befest_fee_at_booking?: number | null
          total_estimated_price?: number | null
          provider_notes?: string | null
          client_notes?: string | null
          booking_status?: EventServiceStatus
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
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
        Insert: {
          id?: string
          event_id: string
          service_id: string
          status?: BookingStatus
          price: number
          guest_count: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          service_id?: string
          status?: BookingStatus
          price?: number
          guest_count?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      event_status: EventStatus
      service_status: ServiceStatus
      event_service_status: EventServiceStatus
      booking_status: BookingStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Subcategory = Database['public']['Tables']['subcategories']['Row']
export type SubcategoryInsert = Database['public']['Tables']['subcategories']['Insert']
export type SubcategoryUpdate = Database['public']['Tables']['subcategories']['Update']

export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']

export type Service = Database['public']['Tables']['services']['Row']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']

export type ServiceGuestTier = Database['public']['Tables']['service_guest_tiers']['Row']
export type ServiceGuestTierInsert = Database['public']['Tables']['service_guest_tiers']['Insert']
export type ServiceGuestTierUpdate = Database['public']['Tables']['service_guest_tiers']['Update']

export type ServiceAgePricingRule = Database['public']['Tables']['service_age_pricing_rules']['Row']
export type ServiceAgePricingRuleInsert = Database['public']['Tables']['service_age_pricing_rules']['Insert']
export type ServiceAgePricingRuleUpdate = Database['public']['Tables']['service_age_pricing_rules']['Update']

export type ServiceDateSurcharge = Database['public']['Tables']['service_date_surcharges']['Row']
export type ServiceDateSurchargeInsert = Database['public']['Tables']['service_date_surcharges']['Insert']
export type ServiceDateSurchargeUpdate = Database['public']['Tables']['service_date_surcharges']['Update']

export type EventService = Database['public']['Tables']['event_services']['Row']
export type EventServiceInsert = Database['public']['Tables']['event_services']['Insert']
export type EventServiceUpdate = Database['public']['Tables']['event_services']['Update']

export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
export type BookingUpdate = Database['public']['Tables']['bookings']['Update']

// Extended types with relationships
export type ServiceWithProvider = Service & {
  provider: Pick<User, 'id' | 'full_name' | 'organization_name' | 'logo_url' | 'area_of_operation'>
}

export type ServiceWithDetails = Service & {
  provider: Pick<User, 'id' | 'full_name' | 'organization_name' | 'logo_url' | 'area_of_operation'>
  guest_tiers: ServiceGuestTier[]
  age_pricing_rules: ServiceAgePricingRule[]
  date_surcharges: ServiceDateSurcharge[]
}

export type EventWithServices = Event & {
  client: Pick<User, 'id' | 'full_name' | 'email' | 'whatsapp_number'>
  event_services: (EventService & {
    service: ServiceWithProvider
  })[]
}

export type EventServiceWithDetails = EventService & {
  event: Pick<Event, 'id' | 'title' | 'event_date' | 'guest_count' | 'location'>
  service: ServiceWithProvider
  provider: Pick<User, 'id' | 'full_name' | 'organization_name' | 'whatsapp_number'>
}

export type BookingWithDetails = Booking & {
  event: Pick<Event, 'id' | 'title' | 'event_date' | 'location' | 'client_id'>
  service: ServiceWithProvider
} 