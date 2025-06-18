// Tipos baseados na estrutura exata do banco de dados Supabase

// Enums do banco de dados
export type UserRole = 'client' | 'provider' | 'admin';
export type ServiceCategoryEnum = 'Comida e Bebida' | 'Decoração' | 'Entretenimento' | 'Fotografia' | 'Som e Música' | 'Outros';
export type BookingStatusEnum = 'pending_provider_approval' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type PricingMethodEnum = 'fixed_price' | 'percentage_discount' | 'free';
export type SurchargeTypeEnum = 'percentage' | 'fixed_amount';

// Tabela users
export interface User {
  id: string; // UUID
  role: UserRole;
  full_name?: string;
  email?: string;
  organization_name?: string;
  cnpj?: string;
  whatsapp_number?: string;
  logo_url?: string;
  area_of_operation?: string;
  created_at: Date;
  updated_at: Date;
}

// Tabela categories
export interface Category {
  id: string; // UUID
  name: string;
  created_at: Date;
  updated_at: Date;
}

// Tabela subcategories
export interface Subcategory {
  id: string; // UUID
  category_id: string; // UUID
  name: string;
  icon_url?: string;
  created_at: Date;
  updated_at: Date;
}

// Tabela services
export interface Service {
  id: string; // UUID
  provider_id: string; // UUID
  name: string;
  description?: string;
  category: ServiceCategoryEnum;
  images_urls?: string[];
  price_per_guest?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Tabela service_guest_tiers
export interface ServiceGuestTier {
  id: string; // UUID
  service_id: string; // UUID
  min_total_guests: number;
  max_total_guests?: number;
  base_price_per_adult: number;
  tier_description?: string;
  created_at: Date;
  updated_at: Date;
}

// Tabela service_age_pricing_rules
export interface ServiceAgePricingRule {
  id: string; // UUID
  service_id: string; // UUID
  rule_description: string;
  age_min_years: number;
  age_max_years?: number;
  pricing_method: PricingMethodEnum;
  value: number;
  created_at: Date;
  updated_at: Date;
}

// Tabela service_date_surcharges
export interface ServiceDateSurcharge {
  id: string; // UUID
  service_id: string; // UUID
  surcharge_description: string;
  start_date: Date;
  end_date: Date;
  surcharge_type: SurchargeTypeEnum;
  surcharge_value: number;
  created_at: Date;
  updated_at: Date;
}

// Tabela events
export interface Event {
  id: string; // UUID
  client_id: string; // UUID
  event_name: string;
  event_date: Date;
  start_time: string; // time without time zone
  location_address: string;
  number_of_guests?: number;
  observations?: string;
  created_at: Date;
  updated_at: Date;
}

// Tabela event_services
export interface EventService {
  id: string; // UUID
  event_id: string; // UUID
  service_id: string; // UUID
  provider_id: string; // UUID
  price_per_guest_at_booking: number;
  befest_fee_at_booking: number;
  total_estimated_price: number;
  booking_status: BookingStatusEnum;
  provider_notes?: string;
  client_notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Tipos para resposta da API com relacionamentos
export interface ServiceProvider extends User {
  role: 'provider';
  services?: Service[];
}

export interface ServiceWithRelations extends Service {
  provider: ServiceProvider;
  guest_tiers: ServiceGuestTier[];
  age_pricing_rules: ServiceAgePricingRule[];
  date_surcharges: ServiceDateSurcharge[];
}

export interface SubcategoryWithCategory extends Subcategory {
  category: Category;
}

export interface EventWithRelations extends Event {
  client: User;
  event_services: (EventService & {
    service: ServiceWithRelations;
    provider: ServiceProvider;
  })[];
}

// Tipos para formulários
export interface CreateEventRequest {
  event_name: string;
  event_date: string;
  start_time: string;
  location_address: string;
  number_of_guests: number;
  observations?: string;
  selected_services: {
    service_id: string;
    provider_id: string;
    price_per_guest: number;
  }[];
}

export interface BudgetCalculation {
  service_id: string;
  service_name: string;
  provider_name: string;
  base_price_per_guest: number;
  applicable_tier?: ServiceGuestTier;
  age_adjustments: {
    age_group: string;
    count: number;
    price_per_person: number;
    total: number;
  }[];
  date_surcharges: {
    description: string;
    type: SurchargeTypeEnum;
    value: number;
    applied_amount: number;
  }[];
  subtotal: number;
  befest_fee: number;
  total: number;
}

export interface BudgetSummary {
  event_name: string;
  event_date: string;
  start_time: string;
  location_address: string;
  number_of_guests: number;
  selected_services: BudgetCalculation[];
  subtotal: number;
  total_befest_fees: number;
  total_estimated_price: number;
}
