// Simulação de API calls para a estrutura do banco de dados Supabase

import { 
  ServiceProvider, 
  Service, 
  Category, 
  Subcategory,
  ServiceWithRelations,
  ServiceGuestTier,
  ServiceAgePricingRule,
  ServiceDateSurcharge,
  CreateEventRequest,
  BudgetSummary,
  BudgetCalculation,
  SubcategoryWithCategory,
  ServiceCategoryEnum
} from '@/types/database';

// Mock data para desenvolvimento
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Comida e Bebida',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'cat-2',
    name: 'Decoração',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'cat-3',
    name: 'Entretenimento',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'cat-4',
    name: 'Fotografia',
    created_at: new Date(),
    updated_at: new Date()
  }
];

const mockSubcategories: SubcategoryWithCategory[] = [
  {
    id: 'sub-1',
    category_id: 'cat-1',
    name: 'Serviços de Buffet',
    created_at: new Date(),
    updated_at: new Date(),
    category: mockCategories[0]
  },
  {
    id: 'sub-2',
    category_id: 'cat-1',
    name: 'Bebidas Especiais',
    created_at: new Date(),
    updated_at: new Date(),
    category: mockCategories[0]
  },
  {
    id: 'sub-3',
    category_id: 'cat-2',
    name: 'Decoração de Eventos',
    created_at: new Date(),
    updated_at: new Date(),
    category: mockCategories[1]
  }
];

// Mock providers
const mockProviders: ServiceProvider[] = [
  {
    id: 'provider-1',
    role: 'provider',
    full_name: "Barreto's Buffet",
    email: 'contato@barretosbuffet.com.br',
    organization_name: "Barreto's Buffet Ltda",
    whatsapp_number: '+5511999999999',
    logo_url: '/images/outros/Design sem nome (37) 1.png',
    area_of_operation: 'São Paulo - Vila Madalena',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'provider-2',
    role: 'provider',
    full_name: "Maria's Buffet",
    email: 'contato@mariasbuffet.com.br',
    organization_name: "Maria's Buffet Ltda",
    whatsapp_number: '+5511888888888',
    logo_url: '/images/outros/Design sem nome (38) 1.png',
    area_of_operation: 'São Paulo - Pinheiros',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'provider-3',
    role: 'provider',
    full_name: "Adega Wine Menu",
    email: 'contato@adegawinemenu.com.br',
    organization_name: "Adega Wine Menu Ltda",
    whatsapp_number: '+5511777777777',
    logo_url: '/images/outros/Design sem nome (39) 1.png',
    area_of_operation: 'São Paulo - Jardins',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Mock guest tiers
const mockGuestTiers: ServiceGuestTier[] = [
  {
    id: 'tier-1',
    service_id: 'svc-1',
    min_total_guests: 30,
    max_total_guests: 50,
    base_price_per_adult: 140.00,
    tier_description: 'Grupo pequeno',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'tier-2',
    service_id: 'svc-1',
    min_total_guests: 51,
    max_total_guests: 100,
    base_price_per_adult: 130.00,
    tier_description: 'Grupo médio',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'tier-3',
    service_id: 'svc-1',
    min_total_guests: 101,
    max_total_guests: undefined,
    base_price_per_adult: 120.00,
    tier_description: 'Grupo grande',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Mock age pricing rules
const mockAgePricingRules: ServiceAgePricingRule[] = [
  {
    id: 'age-rule-1',
    service_id: 'svc-1',
    rule_description: 'Crianças de 6 a 12 anos',
    age_min_years: 6,
    age_max_years: 12,
    pricing_method: 'percentage_discount',
    value: 50, // 50% de desconto
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'age-rule-2',
    service_id: 'svc-1',
    rule_description: 'Crianças de 0 a 5 anos',
    age_min_years: 0,
    age_max_years: 5,
    pricing_method: 'free',
    value: 0,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Mock date surcharges
const mockDateSurcharges: ServiceDateSurcharge[] = [
  {
    id: 'surcharge-1',
    service_id: 'svc-1',
    surcharge_description: 'Taxa de fim de ano',
    start_date: new Date('2024-12-01'),
    end_date: new Date('2024-12-31'),
    surcharge_type: 'fixed_amount',
    surcharge_value: 10.00,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// API functions
export const api = {
  // Buscar todos os prestadores
  async getServiceProviders(): Promise<ServiceProvider[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockProviders;
  },

  // Buscar prestador por ID
  async getServiceProviderById(id: string): Promise<ServiceProvider | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const provider = mockProviders.find(p => p.id === id);
    
    if (!provider) return null;

    // Adicionar serviços do prestador
    const services = await this.getServicesByProviderId(id);
    return {
      ...provider,
      services
    };
  },

  // Buscar serviços por prestador
  async getServicesByProviderId(providerId: string): Promise<Service[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 'svc-1',
        provider_id: providerId,
        name: 'Churras Master',
        description: 'Churrasco completo com carnes nobres - Inclui acompanhamentos',
        category: 'Comida e Bebida' as ServiceCategoryEnum,
        price_per_guest: 140.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'svc-2',
        provider_id: providerId,
        name: 'Churras Gold',
        description: 'Churrasco tradicional com variedade de carnes',
        category: 'Comida e Bebida' as ServiceCategoryEnum,
        price_per_guest: 100.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'svc-3',
        provider_id: providerId,
        name: 'Coffee Break',
        description: 'Lanche para eventos corporativos',
        category: 'Comida e Bebida' as ServiceCategoryEnum,
        price_per_guest: 25.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'svc-4',
        provider_id: providerId,
        name: 'Buffet Infantil',
        description: 'Buffet especial para crianças',
        category: 'Comida e Bebida' as ServiceCategoryEnum,
        price_per_guest: 55.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  },

  // Buscar categorias
  async getCategories(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCategories;
  },

  // Buscar subcategorias por categoria
  async getSubcategoriesByCategory(categoryId: string): Promise<SubcategoryWithCategory[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockSubcategories.filter(sub => sub.category_id === categoryId);
  },

  // Buscar detalhes completos do serviço
  async getServiceWithRelations(serviceId: string): Promise<ServiceWithRelations | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Buscar serviço base
    const allServices = await Promise.all(
      mockProviders.map(p => this.getServicesByProviderId(p.id))
    );
    const service = allServices.flat().find(s => s.id === serviceId);
    
    if (!service) return null;

    const provider = mockProviders.find(p => p.id === service.provider_id);
    if (!provider) return null;

    return {
      ...service,
      provider,
      guest_tiers: mockGuestTiers.filter(tier => tier.service_id === serviceId),
      age_pricing_rules: mockAgePricingRules.filter(rule => rule.service_id === serviceId),
      date_surcharges: mockDateSurcharges.filter(surcharge => surcharge.service_id === serviceId)
    };
  },

  // Calcular orçamento
  async calculateBudget(data: {
    event_date: string;
    number_of_guests: number;
    age_breakdown: {
      adults: number;
      children_6_12: number;
      children_0_5: number;
    };
    selected_services: {
      service_id: string;
      provider_id: string;
    }[];
  }): Promise<BudgetSummary> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const calculations: BudgetCalculation[] = [];
    let subtotal = 0;
    let totalBefestFees = 0;

    for (const serviceRequest of data.selected_services) {
      const serviceDetails = await this.getServiceWithRelations(serviceRequest.service_id);
      if (!serviceDetails) continue;

      // Encontrar tier aplicável
      const applicableTier = serviceDetails.guest_tiers
        .find(tier => 
          data.number_of_guests >= tier.min_total_guests && 
          (tier.max_total_guests === undefined || data.number_of_guests <= tier.max_total_guests)
        );

      const basePrice = applicableTier?.base_price_per_adult || serviceDetails.price_per_guest || 0;

      // Calcular ajustes por idade
      const ageAdjustments = [];
      let adultsTotal = data.age_breakdown.adults * basePrice;
      ageAdjustments.push({
        age_group: 'Adultos',
        count: data.age_breakdown.adults,
        price_per_person: basePrice,
        total: adultsTotal
      });

      // Crianças 6-12 anos (50% desconto)
      const children6_12Price = basePrice * 0.5;
      const children6_12Total = data.age_breakdown.children_6_12 * children6_12Price;
      ageAdjustments.push({
        age_group: 'Crianças 6-12 anos',
        count: data.age_breakdown.children_6_12,
        price_per_person: children6_12Price,
        total: children6_12Total
      });

      // Crianças 0-5 anos (gratuito)
      ageAdjustments.push({
        age_group: 'Crianças 0-5 anos',
        count: data.age_breakdown.children_0_5,
        price_per_person: 0,
        total: 0
      });

      // Calcular sobretaxas por data
      const eventDate = new Date(data.event_date);
      const dateSurcharges = serviceDetails.date_surcharges
        .filter(surcharge => eventDate >= surcharge.start_date && eventDate <= surcharge.end_date)
        .map(surcharge => {
          const appliedAmount = surcharge.surcharge_type === 'fixed_amount' 
            ? surcharge.surcharge_value * data.number_of_guests
            : (adultsTotal + children6_12Total) * (surcharge.surcharge_value / 100);
          
          return {
            description: surcharge.surcharge_description,
            type: surcharge.surcharge_type,
            value: surcharge.surcharge_value,
            applied_amount: appliedAmount
          };
        });

      const totalSurcharges = dateSurcharges.reduce((sum, surcharge) => sum + surcharge.applied_amount, 0);
      const serviceSubtotal = adultsTotal + children6_12Total + totalSurcharges;
      const befestFee = serviceSubtotal * 0.1; // 10% taxa BeFest
      const serviceTotal = serviceSubtotal + befestFee;

      calculations.push({
        service_id: serviceRequest.service_id,
        service_name: serviceDetails.name,
        provider_name: serviceDetails.provider.organization_name || serviceDetails.provider.full_name || 'Prestador',
        base_price_per_guest: basePrice,
        applicable_tier: applicableTier,
        age_adjustments: ageAdjustments,
        date_surcharges: dateSurcharges,
        subtotal: serviceSubtotal,
        befest_fee: befestFee,
        total: serviceTotal
      });

      subtotal += serviceSubtotal;
      totalBefestFees += befestFee;
    }

    return {
      event_name: 'Minha Festa',
      event_date: data.event_date,
      start_time: '19:00',
      location_address: 'Endereço do evento',
      number_of_guests: data.number_of_guests,
      selected_services: calculations,
      subtotal,
      total_befest_fees: totalBefestFees,
      total_estimated_price: subtotal + totalBefestFees
    };
  },

  // Criar evento/orçamento
  async createEvent(data: CreateEventRequest): Promise<{ success: boolean; event_id?: string; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular validação
    if (!data.event_name || !data.event_date || data.selected_services.length === 0) {
      return {
        success: false,
        message: 'Dados incompletos para criar o evento'
      };
    }
    
    // Simular criação do evento
    const eventId = `event-${Date.now()}`;
    
    return {
      success: true,
      event_id: eventId,
      message: 'Orçamento enviado com sucesso! Entraremos em contato em breve.'
    };
  },

  // Criar solicitação de orçamento (alias para createEvent)
  async createBudgetRequest(data: CreateEventRequest): Promise<{ success: boolean; event_id?: string; message: string }> {
    return this.createEvent(data);
  }
};

// Hook personalizado para usar a API
export const useApi = () => {
  return api;
};
