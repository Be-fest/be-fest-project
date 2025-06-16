'use client';

import { motion } from 'framer-motion';

const categories = [
  { id: 'comida', name: 'Comida', emoji: '🍕', color: '#FF6B6B' },
  { id: 'bebida', name: 'Bebida', emoji: '🍺', color: '#4ECDC4' },
  { id: 'doces', name: 'Doces', emoji: '🧁', color: '#45B7D1' },
  { id: 'frutas', name: 'Frutas', emoji: '🍓', color: '#96CEB4' },
  { id: 'hamburger', name: 'Hambúrguer', emoji: '🍔', color: '#FECA57' },
  { id: 'churrasco', name: 'Churrasco', emoji: '🥩', color: '#FF9FF3' },
  { id: 'bebidas', name: 'Bebidas', emoji: '🍹', color: '#54A0FF' },
  { id: 'cerveja', name: 'Cerveja', emoji: '🍻', color: '#5F27CD' },
  { id: 'cafe', name: 'Café', emoji: '☕', color: '#FF6348' },
  { id: 'chat', name: 'Chat', emoji: '💬', color: '#00D2D3', isSpecial: true }
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

        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className={`flex flex-col items-center p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 ${
                category.isSpecial 
                  ? 'bg-gradient-to-br from-[#00D2D3] to-[#00A8A9] text-white shadow-lg' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div 
                className={`text-4xl mb-3 p-3 rounded-full ${
                  category.isSpecial ? 'bg-white/20' : 'bg-white'
                }`}
                style={{ backgroundColor: category.isSpecial ? 'rgba(255,255,255,0.2)' : undefined }}
              >
                {category.emoji}
              </div>
              <span className={`text-sm font-medium text-center ${
                category.isSpecial ? 'text-white' : 'text-gray-700'
              }`}>
                {category.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
