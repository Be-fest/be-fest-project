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
    name: "Pizzaria do Fábio",
    description: "A melhor pizzaria da região, com sabores tradicionais e especiais.",
    category: "Comida e Bebida",
    rating: 4.7,
    reviewCount: 234,
    location: {
      city: "São Paulo",
      neighborhood: "Pinheiros",
      state: "SP"
    },
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=300&fit=crop",
    contact: {
      phone: "(11) 88888-8888",
      email: "contato@pizzariadofabio.com.br",
      whatsapp: "5511888888888"
    },
    services: [
      {
        id: 1,
        category: "Pizzas",
        items: [
          {
            id: 1,
            name: "Pizza Festa Básica",
            description: "10 pizzas grandes com até 2 sabores cada",
            price: 300.00,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop"
          },
          {
            id: 2,
            name: "Pizza Festa Premium",
            description: "15 pizzas grandes com até 3 sabores cada + refrigerantes",
            price: 500.00,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop"
          }
        ]
      }
    ]
  },
  {
    id: "3",
    name: "Bar do Leandro",
    description: "Especialista em drinks e coquetéis para festas e eventos.",
    category: "Comida e Bebida",
    rating: 4.9,
    reviewCount: 178,
    location: {
      city: "São Paulo",
      neighborhood: "Vila Olímpia",
      state: "SP"
    },
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&h=300&fit=crop",
    contact: {
      phone: "(11) 77777-7777",
      email: "contato@bardoleandro.com.br",
      whatsapp: "5511777777777"
    },
    services: [
      {
        id: 1,
        category: "Drinks",
        items: [
          {
            id: 1,
            name: "Open Bar Clássico",
            description: "Drinks clássicos, cerveja, refrigerantes e água",
            price: 50.00,
            image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=200&fit=crop"
          },
          {
            id: 2,
            name: "Open Bar Premium",
            description: "Drinks premium, coquetéis especiais e espumante",
            price: 80.00,
            image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&h=200&fit=crop"
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
