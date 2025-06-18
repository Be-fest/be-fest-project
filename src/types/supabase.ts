export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
        Relationships: []
      }
      events: {
        Row: {
          id: string
          client_id: string
          event_name: string
          event_date: string
          start_time: string
          location_address: string
          number_of_guests: number | null
          observations: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          event_name?: string
          event_date: string
          start_time: string
          location_address: string
          number_of_guests?: number | null
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          event_name?: string
          event_date?: string
          start_time?: string
          location_address?: string
          number_of_guests?: number | null
          observations?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      event_services: {
        Row: {
          id: string
          event_id: string
          service_id: string
          provider_id: string
          price_per_guest_at_booking: number
          befest_fee_at_booking: number
          total_estimated_price: number
          booking_status: Database["public"]["Enums"]["booking_status_enum"]
          provider_notes: string | null
          client_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          service_id: string
          provider_id: string
          price_per_guest_at_booking: number
          befest_fee_at_booking: number
          total_estimated_price: number
          booking_status?: Database["public"]["Enums"]["booking_status_enum"]
          provider_notes?: string | null
          client_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          service_id?: string
          provider_id?: string
          price_per_guest_at_booking?: number
          befest_fee_at_booking?: number
          total_estimated_price?: number
          booking_status?: Database["public"]["Enums"]["booking_status_enum"]
          provider_notes?: string | null
          client_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_services_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: string
          provider_id: string
          name: string
          description: string | null
          category: Database["public"]["Enums"]["service_category_enum"]
          images_urls: string[] | null
          price_per_guest: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          name: string
          description?: string | null
          category?: Database["public"]["Enums"]["service_category_enum"]
          images_urls?: string[] | null
          price_per_guest?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          name?: string
          description?: string | null
          category?: Database["public"]["Enums"]["service_category_enum"]
          images_urls?: string[] | null
          price_per_guest?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      service_age_pricing_rules: {
        Row: {
          id: string
          service_id: string
          rule_description: string
          age_min_years: number
          age_max_years: number | null
          pricing_method: Database["public"]["Enums"]["pricing_method_enum"]
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
          pricing_method: Database["public"]["Enums"]["pricing_method_enum"]
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
          pricing_method?: Database["public"]["Enums"]["pricing_method_enum"]
          value?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_age_pricing_rules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      service_date_surcharges: {
        Row: {
          id: string
          service_id: string
          surcharge_description: string
          start_date: string
          end_date: string
          surcharge_type: Database["public"]["Enums"]["surcharge_type_enum"]
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
          surcharge_type: Database["public"]["Enums"]["surcharge_type_enum"]
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
          surcharge_type?: Database["public"]["Enums"]["surcharge_type_enum"]
          surcharge_value?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_date_surcharges_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "service_guest_tiers_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          full_name: string | null
          email: string | null
          organization_name: string | null
          cnpj: string | null
          whatsapp_number: string | null
          logo_url: string | null
          area_of_operation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          full_name?: string | null
          email?: string | null
          organization_name?: string | null
          cnpj?: string | null
          whatsapp_number?: string | null
          logo_url?: string | null
          area_of_operation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          full_name?: string | null
          email?: string | null
          organization_name?: string | null
          cnpj?: string | null
          whatsapp_number?: string | null
          logo_url?: string | null
          area_of_operation?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status_enum: "pending_provider_approval" | "approved" | "rejected" | "cancelled" | "completed"
      pricing_method_enum: "fixed_price" | "percentage_discount" | "free"
      service_category_enum: "Comida e Bebida" | "Decoração" | "Entretenimento" | "Fotografia" | "Som e Música" | "Outros"
      surcharge_type_enum: "percentage" | "fixed_amount"
      user_role: "client" | "provider" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
