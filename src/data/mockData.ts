// Mock data seguindo a estrutura do banco de dados Supabase

// Enums baseados no schema
export type UserRole = 'client' | 'provider';
export type ServiceCategory = 'Comida e Bebida';
export type BookingStatus = 'pending_provider_approval' | 'approved' | 'cancelled' | 'completed';
export type PricingMethod = 'fixed_price' | 'percentage' | 'multiplier';
export type SurchargeType = 'fixed_amount' | 'percentage';

// Interfaces baseadas nas tabelas do banco
export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  role: UserRole;
  full_name?: string;
  email?: string;
  organization_name?: string;
  cnpj?: string;
  whatsapp_number?: string;
  logo_url?: string;
  area_of_operation?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  images_urls?: string[];
  price_per_guest?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceGuestTier {
  id: string;
  service_id: string;
  min_total_guests: number;
  max_total_guests?: number;
  base_price_per_adult: number;
  tier_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceDateSurcharge {
  id: string;
  service_id: string;
  surcharge_description: string;
  start_date: string;
  end_date: string;
  surcharge_type: SurchargeType;
  surcharge_value: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceAgePricingRule {
  id: string;
  service_id: string;
  rule_description: string;
  age_min_years: number;
  age_max_years?: number;
  pricing_method: PricingMethod;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  client_id: string;
  event_name: string;
  event_date: string;
  start_time: string;
  location_address: string;
  number_of_guests?: number;
  observations?: string;
  created_at: string;
  updated_at: string;
}

export interface EventService {
  id: string;
  event_id: string;
  service_id: string;
  provider_id: string;
  price_per_guest_at_booking: number;
  befest_fee_at_booking: number;
  total_estimated_price: number;
  booking_status: BookingStatus;
  provider_notes?: string;
  client_notes?: string;
  created_at: string;
  updated_at: string;
}

// Dados Mock
const now = new Date().toISOString();

// Categorias
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Comida e Bebida',
    created_at: now,
    updated_at: now,
  }
];

// Usuários (Prestadores)
export const mockProviders: User[] = [
  {
    id: '1',
    role: 'provider',
    full_name: 'João Barreto',
    email: 'joao@barretosbuffet.com.br',
    organization_name: "Barreto's Buffet",
    cnpj: '12.345.678/0001-90',
    whatsapp_number: '11999999999',
    logo_url: '/images/outros/provider1.png',
    area_of_operation: 'Vila Madalena, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '2',
    role: 'provider',
    full_name: 'Maria Santos',
    email: 'maria@churrasmaster.com.br',
    organization_name: "Churras Master",
    cnpj: '12.345.678/0001-91',
    whatsapp_number: '11888888888',
    logo_url: '/images/outros/Design sem nome (38) 1.png',
    area_of_operation: 'Pinheiros, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '3',
    role: 'provider',
    full_name: 'Carlos Oliveira',
    email: 'carlos@pizzariadofabio.com.br',
    organization_name: "Pizzaria do Fábio",
    cnpj: '12.345.678/0001-92',
    whatsapp_number: '11777777777',
    logo_url: '/images/outros/Design sem nome (44) 1.png',
    area_of_operation: 'Itaim Bibi, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '4',
    role: 'provider',
    full_name: 'Ana Costa',
    email: 'ana@decoracaoelegante.com.br',
    organization_name: "Decoração Elegante",
    cnpj: '12.345.678/0001-93',
    whatsapp_number: '11666666666',
    logo_url: '/images/outros/Design sem nome (39) 1.png',
    area_of_operation: 'Jardins, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '5',
    role: 'provider',
    full_name: 'Pedro Silva',
    email: 'pedro@fotopedro.com.br',
    organization_name: "Foto Pedro",
    cnpj: '12.345.678/0001-94',
    whatsapp_number: '11555555555',
    logo_url: '/images/outros/Design sem nome (40) 1.png',
    area_of_operation: 'Vila Olímpia, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '6',
    role: 'provider',
    full_name: 'Lucas Mendes',
    email: 'lucas@cervejariaartesanal.com.br',
    organization_name: "Cervejaria Artesanal",
    cnpj: '12.345.678/0001-95',
    whatsapp_number: '11444444444',
    logo_url: '/images/outros/Design sem nome (42) 1.png',
    area_of_operation: 'Moema, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '7',
    role: 'provider',
    full_name: 'José Almeida',
    email: 'jose@josespizzaria.com.br',
    organization_name: "Jose's Pizzaria",
    cnpj: '12.345.678/0001-96',
    whatsapp_number: '11333333333',
    logo_url: '/images/outros/Design sem nome (43) 1.png',
    area_of_operation: 'Brooklin, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '8',
    role: 'provider',
    full_name: 'Fabio Rodrigues',
    email: 'fabio@pizzariadofabio2.com.br',
    organization_name: "Pizzaria do Fábio 2",
    cnpj: '12.345.678/0001-97',
    whatsapp_number: '11222222222',
    logo_url: '/images/outros/Design sem nome (44) 1.png',
    area_of_operation: 'Santo Amaro, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '9',
    role: 'provider',
    full_name: 'Carla Vegana',
    email: 'carla@cozinhavegana.com.br',
    organization_name: "Cozinha Vegana",
    cnpj: '12.345.678/0001-98',
    whatsapp_number: '11111111111',
    logo_url: '/images/outros/Design sem nome (45) 1.png',
    area_of_operation: 'Vila Madalena, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '10',
    role: 'provider',
    full_name: 'Roberto Santos',
    email: 'roberto@sorvetes.com.br',
    organization_name: "Sorvetes Artesanais",
    cnpj: '12.345.678/0001-99',
    whatsapp_number: '11000000000',
    logo_url: '/images/outros/Design sem nome (46) 1.png',
    area_of_operation: 'Perdizes, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '11',
    role: 'provider',
    full_name: 'Marcos Burger',
    email: 'marcos@hamburguerspot.com.br',
    organization_name: "Hamburguer Spot",
    cnpj: '12.345.678/0001-10',
    whatsapp_number: '11999999000',
    logo_url: '/images/outros/Design sem nome (47) 1.png',
    area_of_operation: 'Liberdade, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
  {
    id: '12',
    role: 'provider',
    full_name: 'Leandro Barman',
    email: 'leandro@bardoleandro.com.br',
    organization_name: "Bar do Leandro",
    cnpj: '12.345.678/0001-11',
    whatsapp_number: '11888888000',
    logo_url: '/images/outros/Design sem nome (37) 1.png',
    area_of_operation: 'Bela Vista, São Paulo - SP',
    created_at: now,
    updated_at: now,
  },
];

// Serviços
export const mockServices: Service[] = [
  // Serviços do Barreto's Buffet
  {
    id: 'svc-1',
    provider_id: '1',
    name: 'Churras Master',
    description: 'Churras completo com carnes nobres, acompanhamentos e saladas',
    category: 'Comida e Bebida',
    images_urls: ['/images/categories/comida-bebida.png'],
    price_per_guest: 140.00,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'svc-2',
    provider_id: '1',
    name: 'Churras Gold',
    description: 'Churras premium com carnes selecionadas e buffet completo',
    category: 'Comida e Bebida',
    images_urls: ['/images/categories/comida-bebida.png'],
    price_per_guest: 100.00,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'svc-3',
    provider_id: '1',
    name: 'Churras Silver',
    description: 'Churras tradicional com carnes variadas e acompanhamentos',
    category: 'Comida e Bebida',
    images_urls: ['/images/categories/comida-bebida.png'],
    price_per_guest: 80.00,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'svc-4',
    provider_id: '1',
    name: 'Almoço Executivo',
    description: 'Almoço completo com pratos executivos variados',
    category: 'Comida e Bebida',
    images_urls: ['/images/categories/comida-bebida.png'],
    price_per_guest: 45.00,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'svc-5',
    provider_id: '1',
    name: 'Coffee Break',
    description: 'Coffee break completo com salgados, doces e bebidas',
    category: 'Comida e Bebida',
    images_urls: ['/images/categories/comida-bebida.png'],
    price_per_guest: 25.00,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'svc-6',
    provider_id: '1',
    name: 'Cocktail',
    description: 'Cocktail sofisticado com canapés e bebidas especiais',
    category: 'Comida e Bebida',
    images_urls: ['/images/categories/comida-bebida.png'],
    price_per_guest: 75.00,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'svc-7',
    provider_id: '1',
    name: 'Massas',
    description: 'Buffet de massas italianas com molhos variados',
    category: 'Comida e Bebida',
    images_urls: ['/images/categories/comida-bebida.png'],
    price_per_guest: 90.00,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

// Tiers de preços por número de convidados
export const mockServiceGuestTiers: ServiceGuestTier[] = [
  {
    id: 'tier-1',
    service_id: 'svc-1', // Churras Master
    min_total_guests: 30,
    max_total_guests: 50,
    base_price_per_adult: 140.00,
    tier_description: 'Mínimo 30 convidados',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tier-2',
    service_id: 'svc-1', // Churras Master
    min_total_guests: 51,
    max_total_guests: 100,
    base_price_per_adult: 135.00,
    tier_description: '51-100 convidados - 5% desconto',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tier-3',
    service_id: 'svc-2', // Churras Gold
    min_total_guests: 30,
    max_total_guests: 50,
    base_price_per_adult: 100.00,
    tier_description: 'Mínimo 30 convidados',
    created_at: now,
    updated_at: now,
  },
];

// Função para buscar dados do mock
export const getMockProviderById = (id: string): User | undefined => {
  return mockProviders.find(provider => provider.id === id);
};

export const getMockServicesByProviderId = (providerId: string): Service[] => {
  return mockServices.filter(service => service.provider_id === providerId);
};

export const getMockServiceById = (id: string): Service | undefined => {
  return mockServices.find(service => service.id === id);
};

export const getMockProviderServices = (providerId: string) => {
  const services = getMockServicesByProviderId(providerId);
  
  // Agrupar serviços por categoria para exibição
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price_per_guest || 0,
      image: service.images_urls?.[0] || '/images/categories/comida-bebida.png'
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Converter para formato esperado pelo componente
  return Object.entries(groupedServices).map(([category, items], index) => ({
    id: index + 1,
    category,
    items
  }));
};

// Função para buscar avaliações (mock)
export const getMockProviderRating = (providerId: string) => {
  // Simular diferentes ratings para cada prestador
  const ratings = {
    '1': { rating: 4.8, reviews: 156 },
    '2': { rating: 4.7, reviews: 89 },
    '3': { rating: 4.6, reviews: 234 },
    '4': { rating: 4.9, reviews: 67 },
    '5': { rating: 4.5, reviews: 123 },
    '6': { rating: 4.8, reviews: 98 },
    '7': { rating: 4.7, reviews: 145 },
    '8': { rating: 4.6, reviews: 76 },
    '9': { rating: 4.9, reviews: 134 },
    '10': { rating: 4.5, reviews: 87 },
    '11': { rating: 4.7, reviews: 112 },
    '12': { rating: 4.8, reviews: 156 },
  };
  
  return ratings[providerId as keyof typeof ratings] || { rating: 4.5, reviews: 50 };
};
