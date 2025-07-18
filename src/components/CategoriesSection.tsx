'use client';

import { motion } from 'framer-motion';

const categories = [
  { id: 'comida-e-bebida', name: 'COMIDA E BEBIDA', emoji: '🍽️', color: '#FF6B6B' },
  { id: 'entretenimento', name: 'ENTRETENIMENTO', emoji: '�', color: '#4ECDC4' },
  { id: 'espaco', name: 'ESPAÇO', emoji: '🏛️', color: '#45B7D1' },
  { id: 'organizacao', name: 'ORGANIZAÇÃO', emoji: '📋', color: '#96CEB4' }
];

export function CategoriesSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Escolha sua categoria
          </h2>
          <p className="text-xl text-gray-600">
            Encontre o que precisa para sua festa perfeita
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 bg-white hover:bg-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div 
                className="text-4xl mb-3 p-3 rounded-full bg-white"
                style={{ backgroundColor: category.color + '20' }}
              >
                {category.emoji}
              </div>
              <span className="text-sm font-medium text-center text-gray-700">
                {category.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
