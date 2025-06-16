'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const providers = [
  { name: "Barreto's Buffet", category: "Comida e Bebida", logo: "/placeholder-logo.png" },
  { name: "Maria's Buffet", category: "Comida e Bebida", logo: "/placeholder-logo.png" },
  { name: "Adega Wine Menu", category: "Bebidas", logo: "/placeholder-logo.png" },
  { name: "Doceria Adocica", category: "Doces", logo: "/placeholder-logo.png" },
  { name: "Churrascaria Boi", category: "Comida e Bebida", logo: "/placeholder-logo.png" },
  { name: "Cervejaria Artesanal", category: "Bebidas", logo: "/placeholder-logo.png" },
  { name: "José 's Pizzaria", category: "Comida e Bebida", logo: "/placeholder-logo.png" },
  { name: "Pizzaria do Fábio", category: "Comida e Bebida", logo: "/placeholder-logo.png" },
  { name: "Cozinha Vegana", category: "Comida e Bebida", logo: "/placeholder-logo.png" },
  { name: "Sorvetie", category: "Sobremesas", logo: "/placeholder-logo.png" },
  { name: "Hamburger Spot", category: "Comida e Bebida", logo: "/placeholder-logo.png" },
  { name: "Bar do Luizinho", category: "Bebidas", logo: "/placeholder-logo.png" }
];

export function ProvidersGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {providers.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{provider.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{provider.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
