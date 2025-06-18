export interface Provider {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: {
    city: string;
    neighborhood: string;
    state: string;
  };
  image: string;
  services: ServiceCategory[];
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
  };
}

export interface ServiceCategory {
  id: number;
  category: string;
  items: ServiceItem[];
}

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export const mockProviders: Provider[] = [
  {
    id: "1",
    name: "Barreto's Buffet",
    description: "Especialistas em buffet completo para festas e eventos. Comida de qualidade, serviço impecável e preços justos.",
    category: "Comida e Bebida",
    rating: 4.8,
    reviewCount: 156,
    location: {
      city: "São Paulo",
      neighborhood: "Vila Madalena",
      state: "SP"
    },
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=300&fit=crop",
    contact: {
      phone: "(11) 99999-9999",
      email: "contato@barretosbuffet.com.br",
      whatsapp: "5511999999999"
    },
    services: [
      {
        id: 1,
        category: "Serviços Principais",
        items: [
          {
            id: 1,
            name: "Churras Master",
            description: "Churrasco completo com carnes nobres e acompanhamentos",
            price: 45.00,
            image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&h=200&fit=crop"
          },
          {
            id: 2,
            name: "Churras Gold",
            description: "Churrasco premium com cortes especiais",
            price: 100.00,
            image: "https://images.unsplash.com/photo-1558030006-450675393462?w=300&h=200&fit=crop"
          },
          {
            id: 3,
            name: "Buffet Completo",
            description: "Buffet com pratos quentes, frios, saladas e sobremesas",
            price: 35.00,
            image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop"
          }
        ]
      },
      {
        id: 2,
        category: "Bebidas",
        items: [
          {
            id: 4,
            name: "Open Bar Básico",
            description: "Refrigerantes, sucos e água à vontade",
            price: 15.00,
            image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop"
          },
          {
            id: 5,
            name: "Open Bar Premium",
            description: "Inclui bebidas alcoólicas e coquetéis",
            price: 40.00,
            image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=200&fit=crop"
          }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Festa & Cia Decorações",
    description: "Transformamos seus sonhos em realidade com decorações únicas e personalizadas para todos os tipos de eventos.",
    category: "Decoração",
    rating: 4.9,
    reviewCount: 203,
    location: {
      city: "São Paulo",
      neighborhood: "Jardins",
      state: "SP"
    },
    image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=300&fit=crop",
    contact: {
      phone: "(11) 88888-8888",
      email: "contato@festacia.com.br",
      whatsapp: "5511888888888"
    },
    services: [
      {
        id: 1,
        category: "Decoração Principal",
        items: [
          {
            id: 1,
            name: "Decoração Infantil",
            description: "Decoração temática completa para festas infantis",
            price: 800.00,
            image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=200&fit=crop"
          },
          {
            id: 2,
            name: "Decoração Casamento",
            description: "Decoração elegante para cerimônia e recepção",
            price: 2500.00,
            image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop"
          },
          {
            id: 3,
            name: "Decoração Corporativa",
            description: "Decoração profissional para eventos empresariais",
            price: 1200.00,
            image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=200&fit=crop"
          }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "SoundMax DJ",
    description: "Som profissional e animação para sua festa. Equipamentos de última geração e DJs experientes.",
    category: "Som e Música",
    rating: 4.7,
    reviewCount: 89,
    location: {
      city: "São Paulo",
      neighborhood: "Moema",
      state: "SP"
    },
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop",
    contact: {
      phone: "(11) 77777-7777",
      email: "contato@soundmaxdj.com.br",
      whatsapp: "5511777777777"
    },
    services: [
      {
        id: 1,
        category: "Serviços de Som",
        items: [
          {
            id: 1,
            name: "DJ + Som Básico",
            description: "DJ profissional com equipamento de som básico",
            price: 400.00,
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop"
          },
          {
            id: 2,
            name: "DJ + Som Premium",
            description: "DJ + equipamentos profissionais + iluminação",
            price: 800.00,
            image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop"
          },
          {
            id: 3,
            name: "Banda Ao Vivo",
            description: "Banda completa para eventos especiais",
            price: 1500.00,
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop"
          }
        ]
      }
    ]
  },
  {
    id: "4",
    name: "Flores & Arranjos Bella",
    description: "Arranjos florais exclusivos e personalizados para tornar seu evento ainda mais especial e memorável.",
    category: "Flores e Arranjos",
    rating: 4.6,
    reviewCount: 134,
    location: {
      city: "São Paulo",
      neighborhood: "Pinheiros",
      state: "SP"
    },
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=500&h=300&fit=crop",
    contact: {
      phone: "(11) 66666-6666",
      email: "contato@floresbella.com.br",
      whatsapp: "5511666666666"
    },
    services: [
      {
        id: 1,
        category: "Arranjos Florais",
        items: [
          {
            id: 1,
            name: "Buquê de Noiva",
            description: "Buquê personalizado para noivas",
            price: 200.00,
            image: "https://images.unsplash.com/photo-1462804512123-465343c607ee?w=300&h=200&fit=crop"
          },
          {
            id: 2,
            name: "Arranjos de Mesa",
            description: "Arranjos florais para decoração de mesas",
            price: 80.00,
            image: "https://images.unsplash.com/photo-1470137430626-983382b6b811?w=300&h=200&fit=crop"
          },
          {
            id: 3,
            name: "Decoração Floral Completa",
            description: "Decoração floral para todo o ambiente",
            price: 1000.00,
            image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=200&fit=crop"
          }
        ]
      }
    ]
  }
];

export const getProviderById = (id: string): Provider | undefined => {
  return mockProviders.find(provider => provider.id === id);
};

export const getProvidersByCategory = (category: string): Provider[] => {
  return mockProviders.filter(provider => provider.category === category);
};

export const getAllProviders = (): Provider[] => {
  return mockProviders;
};
