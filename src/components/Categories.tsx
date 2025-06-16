'use client';

import { motion } from 'framer-motion';

const categories = [
  { name: 'Buffet', icon: '🍽️' },
  { name: 'Pizzaria', icon: '🍕' },
  { name: 'Churrascaria', icon: '🐂' },
  { name: 'Doces', icon: '🧁' },
  { name: 'Hamburgueria', icon: '🍔' },
  { name: 'Sorveteria', icon: '🍦' },
  { name: 'Bar', icon: '🍸' },
  { name: 'Adega', icon: '🍷' },
  { name: 'Cervejaria', icon: '🍺' }
];

export function Categories() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center items-center gap-6 flex-wrap"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-xl group-hover:shadow-lg transition-all duration-300">
                {category.icon}
              </div>
              <span className="text-xs text-gray-600 font-medium">
                {category.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
        
        {/* WhatsApp Float Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-110">
            <span className="text-white text-sm font-bold">W</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
