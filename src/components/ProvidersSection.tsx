'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const providers = [
  {
    id: 1,
    name: "Barbosa Buffet",
    category: "Comida e Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.8
  },
  {
    id: 2,
    name: "Maria's Buffet",
    category: "Comida e Bebida", 
    logo: "/api/placeholder/80/80",
    rating: 4.9
  },
  {
    id: 3,
    name: "Alpaca Wine Menu",
    category: "Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.7
  },
  {
    id: 4,
    name: "Doçaria Adoçar",
    category: "Comida e Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.6
  },
  {
    id: 5,
    name: "Churrascaria Boi Gordo",
    category: "Comida e Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.8
  },
  {
    id: 6,
    name: "Cervejaria Artesanal",
    category: "Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.9
  },
  {
    id: 7,
    name: "Japa´s Pizzaria",
    category: "Comida e Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.7
  },
  {
    id: 8,
    name: "Pizzaria do Fábio",
    category: "Comida e Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.5
  },
  {
    id: 9,
    name: "Cozinha Vegana",
    category: "Comida e Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.8
  },
  {
    id: 10,
    name: "Servicios Artesanales",
    category: "Comida e Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.6
  },
  {
    id: 11,
    name: "Hamburguer Spot",
    category: "Comida e Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.7
  },
  {
    id: 12,
    name: "Bar do Leandro",
    category: "Bebida",
    logo: "/api/placeholder/80/80",
    rating: 4.9
  }
];

export function ProvidersSection() {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: '#FFF9F9' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Nossos Parceiros
          </h2>
          <p className="text-xl text-gray-600">
            Prestadores de serviço verificados e avaliados
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-[#FF0080] rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {provider.name.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">
                    {provider.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {provider.category}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-gray-600 text-sm font-medium">
                    {provider.rating}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button className="bg-[#FF0080] text-white px-8 py-3 rounded-lg hover:bg-[#E6006F] transition-colors font-semibold">
            Ver Todos os Parceiros
          </button>
        </motion.div>
      </div>
    </section>
  );
}
