export interface Provider {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  rating: number;
  reviews: number;
  image: string;
  logo: string;
  address: string;
  description: string;
  services: ServiceCategory[];
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
    id: '1',
    name: "Barreto's Buffet",
    category: 'Comida e Bebida',
    subcategory: 'Serviços de Buffet',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (37) 1.png",
    address: 'Vila Madalena, São Paulo - SP',
    description: 'Especialistas em buffet completo para festas e eventos. Comida de qualidade, serviço impecável e preços justos.',
    services: [
      {
        id: 1,
        category: 'Linha Churras',
        items: [
          {
            id: 1,
            name: 'Churras Master',
            description: 'Mín de 30 convidados',
            price: 140.00,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop'
          },
          {
            id: 2,
            name: 'Churras Gold',
            description: 'Mín de 30 convidados',
            price: 100.00,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop'
          },
          {
            id: 3,
            name: 'Churras Silver',
            description: 'Mín de 30 convidados',
            price: 80.00,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop'
          }
        ]
      },
      {
        id: 2,
        category: 'Linha Gourmet',
        items: [
          {
            id: 4,
            name: 'Almoço/Jantar',
            description: 'Mín de 50 convidados',
            price: 85.00,
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'
          },
          {
            id: 5,
            name: 'Buffet Infantil',
            description: 'Mín de 50 convidados',
            price: 55.00,
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: "Festa & Cia Decorações",
    category: 'Decoração',
    subcategory: 'Decoração Completa',
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (38) 1.png",
    address: 'Jardins, São Paulo - SP',
    description: 'Transformamos seus sonhos em realidade com decorações únicas e personalizadas para todos os tipos de eventos.',
    services: [
      {
        id: 1,
        category: 'Decoração Temática',
        items: [
          {
            id: 1,
            name: 'Festa Infantil',
            description: 'Decoração completa temática',
            price: 800.00,
            image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop'
          },
          {
            id: 2,
            name: 'Casamento',
            description: 'Decoração romântica completa',
            price: 2500.00,
            image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: "SoundMax DJ",
    category: 'Som e Música',
    subcategory: 'DJ e Sonorização',
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (39) 1.png",
    address: 'Moema, São Paulo - SP',
    description: 'Som profissional e animação para sua festa. Equipamentos de última geração e DJs experientes.',
    services: [
      {
        id: 1,
        category: 'Sonorização',
        items: [
          {
            id: 1,
            name: 'DJ + Som Básico',
            description: 'Até 100 pessoas',
            price: 600.00,
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
          },
          {
            id: 2,
            name: 'DJ + Som Completo',
            description: 'Até 300 pessoas',
            price: 1200.00,
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '4',
    name: "Doceria Adocei",
    category: 'Comida e Bebida',
    subcategory: 'Doces e Confeitaria',
    rating: 4.9,
    reviews: 245,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (40) 1.png",
    address: 'Pinheiros, São Paulo - SP',
    description: 'Doces artesanais e bolos personalizados para tornar sua festa ainda mais especial.',
    services: [
      {
        id: 1,
        category: 'Doces e Bolos',
        items: [
          {
            id: 1,
            name: 'Bolo Personalizado',
            description: 'Até 30 pessoas',
            price: 180.00,
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
          },
          {
            id: 2,
            name: 'Mesa de Doces',
            description: 'Doces finos sortidos',
            price: 12.00,
            image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '5',
    name: "Churrascaria Boi Gordo",
    category: 'Comida e Bebida',
    subcategory: 'Churrasco',
    rating: 4.6,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (41) 1.png",
    address: 'Butantã, São Paulo - SP',
    description: 'Churrasco tradicional com carnes selecionadas e tempero especial da casa.',
    services: [
      {
        id: 1,
        category: 'Churrasco',
        items: [
          {
            id: 1,
            name: 'Churrasco Completo',
            description: 'Mín de 20 pessoas',
            price: 65.00,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '6',
    name: "Cervejaria Artesanal",
    category: 'Bebida',
    subcategory: 'Cerveja Artesanal',
    rating: 4.8,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (42) 1.png",
    address: 'Vila Madalena, São Paulo - SP',
    description: 'Cervejas artesanais de alta qualidade para eventos especiais.',
    services: [
      {
        id: 1,
        category: 'Bebidas',
        items: [
          {
            id: 1,
            name: 'Chopp Artesanal',
            description: 'Barril 50L',
            price: 250.00,
            image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '7',
    name: "Jose's Pizzaria",
    category: 'Comida e Bebida',
    subcategory: 'Pizza',
    rating: 4.5,
    reviews: 134,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (43) 1.png",
    address: 'Liberdade, São Paulo - SP',
    description: 'Pizzas artesanais com ingredientes frescos e massa tradicional.',
    services: [
      {
        id: 1,
        category: 'Pizzas',
        items: [
          {
            id: 1,
            name: 'Pizza Grande',
            description: '8 fatias',
            price: 45.00,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '8',
    name: "Pizzaria do Fábio",
    category: 'Comida e Bebida',
    subcategory: 'Pizza',
    rating: 4.4,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (44) 1.png",
    address: 'Consolação, São Paulo - SP',
    description: 'Pizzas caseiras com receitas tradicionais de família.',
    services: [
      {
        id: 1,
        category: 'Pizzas',
        items: [
          {
            id: 1,
            name: 'Pizza Média',
            description: '6 fatias',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '9',
    name: "Cozinha Vegana",
    category: 'Comida e Bebida',
    subcategory: 'Comida Vegana',
    rating: 4.7,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (45) 1.png",
    address: 'Vila Olímpia, São Paulo - SP',
    description: 'Opções veganas saudáveis e saborosas para todos os gostos.',
    services: [
      {
        id: 1,
        category: 'Pratos Veganos',
        items: [
          {
            id: 1,
            name: 'Prato Vegano',
            description: 'Porção individual',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '10',
    name: "Sorvetes Artesanais",
    category: 'Comida e Bebida',
    subcategory: 'Sorvetes',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (46) 1.png",
    address: 'Brooklin, São Paulo - SP',
    description: 'Sorvetes artesanais com sabores únicos e ingredientes naturais.',
    services: [
      {
        id: 1,
        category: 'Sorvetes',
        items: [
          {
            id: 1,
            name: 'Sorvete Artesanal',
            description: '1 litro',
            price: 35.00,
            image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '11',
    name: "Hamburguer Spot",
    category: 'Comida e Bebida',
    subcategory: 'Hambúrguer',
    rating: 4.6,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (47) 1.png",
    address: 'Itaim Bibi, São Paulo - SP',
    description: 'Hambúrgueres gourmet com ingredientes premium.',
    services: [
      {
        id: 1,
        category: 'Hambúrgueres',
        items: [
          {
            id: 1,
            name: 'Hambúrguer Gourmet',
            description: 'Com batata fritas',
            price: 28.00,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: '12',
    name: "Bar do Leandro",
    category: 'Bebida',
    subcategory: 'Bar e Drinks',
    rating: 4.5,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop',
    logo: "/images/outros/Design sem nome (37) 1.png",
    address: 'Bela Vista, São Paulo - SP',
    description: 'Drinks autorais e ambiente descontraído para sua festa.',
    services: [
      {
        id: 1,
        category: 'Drinks',
        items: [
          {
            id: 1,
            name: 'Drink Especial',
            description: 'Preparo na hora',
            price: 18.00,
            image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop'
          }
        ]
      }
    ]
  }
];
