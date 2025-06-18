import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

export type UserRole = Database['public']['Enums']['user_role']
export type ServiceCategory = Database['public']['Enums']['service_category_enum']
export type BookingStatus = Database['public']['Enums']['booking_status_enum']
export type PricingMethod = Database['public']['Enums']['pricing_method_enum']
export type SurchargeType = Database['public']['Enums']['surcharge_type_enum']

export type UserProfile = Database['public']['Tables']['users']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventService = Database['public']['Tables']['event_services']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Subcategory = Database['public']['Tables']['subcategories']['Row']
export type ServiceGuestTier = Database['public']['Tables']['service_guest_tiers']['Row']
export type ServiceAgePricingRule = Database['public']['Tables']['service_age_pricing_rules']['Row']
export type ServiceDateSurcharge = Database['public']['Tables']['service_date_surcharges']['Row']

export interface AuthUser extends User {
  profile?: UserProfile
}

export interface ServiceWithProvider extends Service {
  provider: UserProfile
}

export interface EventWithDetails extends Event {
  client: UserProfile
  event_services: (EventService & {
    service: ServiceWithProvider
    provider: UserProfile
  })[]
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  whatsapp?: string
}

export interface ProviderRegisterFormData {
  organizationName: string
  cnpj: string
  email: string
  password: string
  confirmPassword: string
  whatsapp?: string
  areaOfOperation?: string
}

export interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  login: (data: LoginFormData) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  registerProvider: (data: ProviderRegisterFormData) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}
