'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const providers = [
  { 
    id: '1',
    name: "Barreto's Buffet", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (37) 1.png" 
  },
  { 
    id: '2',
    name: "Maria's Buffet", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (38) 1.png" 
  },
  { 
    id: '3',
    name: "Adega Wine Menu", 
    category: "Bebidas", 
    logo: "/images/outros/Design sem nome (39) 1.png" 
  },
  { 
    id: '4',
    name: "Doceria Adocei", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (40) 1.png" 
  },
  { 
    id: '5',
    name: "Churrascaria Boi", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (41) 1.png" 
  },
  { 
    id: '6',
    name: "Cervejaria Artesanal", 
    category: "Bebida", 
    logo: "/images/outros/Design sem nome (42) 1.png" 
  },
  { 
    id: '7',
    name: "Jose´s Pizzaria", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (43) 1.png" 
  },
  { 
    id: '8',
    name: "Pizzaria do Fábio", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (44) 1.png" 
  },
  { 
    id: '9',
    name: "Cozinha Vegana", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (45) 1.png" 
  },
  { 
    id: '10',
    name: "Sorvetes Artesanais", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (46) 1.png" 
  },
  { 
    id: '11',
    name: "Hamburguer Spot", 
    category: "Comida e Bebida", 
    logo: "/images/outros/Design sem nome (47) 1.png" 
  },
  { 
    id: '12',
    name: "Bar do Leandro", 
    category: "Bebida", 
    logo: "/images/outros/Design sem nome (37) 1.png" 
  }
];

export function ProvidersGrid() {
  const router = useRouter();

  const handleProviderClick = (providerId: string) => {
    router.push(`/prestador/${providerId}`);
  };
  return (
    <section className="py-8 md:py-12" style={{ backgroundColor: '#FFF9F9' }}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick(provider.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100">
                  <Image
                    src={provider.logo}
                    alt={provider.name}
                    width={64}
                    height={64}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight">
                    {provider.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">
                    {provider.category}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
