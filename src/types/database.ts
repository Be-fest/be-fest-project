export type UserRole = 'client' | 'provider' | 'admin'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type ServiceStatus = 'active' | 'inactive'
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  avatar_url: string | null
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
  rating: number
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  client_id: string
  title: string
  description: string | null
  date: string
  location: string | null
  status: EventStatus
  guest_count: number
  budget: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  provider_id: string
  name: string
  description: string | null
  category: string
  base_price: number
  min_guests: number
  max_guests: number | null
  status: ServiceStatus
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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
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
    }
  }
} 