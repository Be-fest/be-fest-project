'use client';

import { motion } from 'framer-motion';
import { MdShoppingCart } from 'react-icons/md';
import { useCart } from '@/contexts/CartContext';
import { useOffCanvas } from '@/contexts/OffCanvasContext';

export function FloatingCart() {
  const { getTotalPrice, getTotalItems } = useCart();
  const { openCart } = useOffCanvas();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Não mostrar o carrinho se estiver vazio
  if (totalItems === 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <motion.button
        onClick={openCart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#FF0080] text-white rounded-full shadow-lg px-6 py-4 flex items-center gap-3 min-w-[160px] justify-between hover:bg-[#E6006F] transition-colors"
      >
        <div className="flex items-center gap-2">
          <MdShoppingCart className="text-xl" />
          <span className="font-semibold">{totalItems}</span>
        </div>
        <span className="font-bold">{formatCurrency(totalPrice)}</span>
      </motion.button>
    </motion.div>
  );
}
