export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          name: string
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_services: {
        Row: {
          event_id: string
          service_id: string
          provider_id: string
          price_per_guest_at_booking: number
          befest_fee_at_booking: number
          total_estimated_price: number
          id: string
          provider_notes: string | null
          client_notes: string | null
          booking_status: 'pending_provider_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          event_id: string
          service_id: string
          provider_id: string
          price_per_guest_at_booking: number
          befest_fee_at_booking: number
          total_estimated_price: number
          id?: string
          provider_notes?: string | null
          client_notes?: string | null
          booking_status?: 'pending_provider_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          event_id?: string
          service_id?: string
          provider_id?: string
          price_per_guest_at_booking?: number
          befest_fee_at_booking?: number
          total_estimated_price?: number
          id?: string
          provider_notes?: string | null
          client_notes?: string | null
          booking_status?: 'pending_provider_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          client_id: string
          event_date: string
          start_time: string
          location_address: string
          number_of_guests: number | null
          observations: string | null
          id: string
          event_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          event_date: string
          start_time: string
          location_address: string
          number_of_guests?: number | null
          observations?: string | null
          id?: string
          event_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          event_date?: string
          start_time?: string
          location_address?: string
          number_of_guests?: number | null
          observations?: string | null
          id?: string
          event_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      service_age_pricing_rules: {
        Row: {
          service_id: string
          rule_description: string
          age_min_years: number
          age_max_years: number | null
          pricing_method: 'fixed' | 'percentage'
          value: number
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          service_id: string
          rule_description: string
          age_min_years: number
          age_max_years?: number | null
          pricing_method: 'fixed' | 'percentage'
          value: number
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          service_id?: string
          rule_description?: string
          age_min_years?: number
          age_max_years?: number | null
          pricing_method?: 'fixed' | 'percentage'
          value?: number
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      service_date_surcharges: {
        Row: {
          service_id: string
          surcharge_description: string
          start_date: string
          end_date: string
          surcharge_type: 'fixed' | 'percentage'
          surcharge_value: number
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          service_id: string
          surcharge_description: string
          start_date: string
          end_date: string
          surcharge_type: 'fixed' | 'percentage'
          surcharge_value: number
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          service_id?: string
          surcharge_description?: string
          start_date?: string
          end_date?: string
          surcharge_type?: 'fixed' | 'percentage'
          surcharge_value?: number
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      service_guest_tiers: {
        Row: {
          service_id: string
          min_total_guests: number
          max_total_guests: number | null
          base_price_per_adult: number
          tier_description: string | null
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          service_id: string
          min_total_guests: number
          max_total_guests?: number | null
          base_price_per_adult: number
          tier_description?: string | null
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          service_id?: string
          min_total_guests?: number
          max_total_guests?: number | null
          base_price_per_adult?: number
          tier_description?: string | null
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          provider_id: string
          name: string
          description: string | null
          images_urls: string[] | null
          price_per_guest: number | null
          id: string
          category: 'Comida e Bebida' | 'Decoração' | 'Entretenimento' | 'Espaço' | 'Outros'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          provider_id: string
          name: string
          description?: string | null
          images_urls?: string[] | null
          price_per_guest?: number | null
          id?: string
          category?: 'Comida e Bebida' | 'Decoração' | 'Entretenimento' | 'Espaço' | 'Outros'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          provider_id?: string
          name?: string
          description?: string | null
          images_urls?: string[] | null
          price_per_guest?: number | null
          id?: string
          category?: 'Comida e Bebida' | 'Decoração' | 'Entretenimento' | 'Espaço' | 'Outros'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subcategories: {
        Row: {
          category_id: string
          name: string
          icon_url: string | null
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          category_id: string
          name: string
          icon_url?: string | null
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          name?: string
          icon_url?: string | null
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          role: 'client' | 'provider' | 'admin'
          full_name: string | null
          email: string | null
          organization_name: string | null
          cnpj: string | null
          whatsapp_number: string | null
          logo_url: string | null
          area_of_operation: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'client' | 'provider' | 'admin'
          full_name?: string | null
          email?: string | null
          organization_name?: string | null
          cnpj?: string | null
          whatsapp_number?: string | null
          logo_url?: string | null
          area_of_operation?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'client' | 'provider' | 'admin'
          full_name?: string | null
          email?: string | null
          organization_name?: string | null
          cnpj?: string | null
          whatsapp_number?: string | null
          logo_url?: string | null
          area_of_operation?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
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
      [_ in never]: never
    }
  }
} 