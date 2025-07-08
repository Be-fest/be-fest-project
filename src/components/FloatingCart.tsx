'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdShoppingCart } from 'react-icons/md';
import { useCart } from '@/contexts/CartContext';
import { useOffCanvas } from '@/contexts/OffCanvasContext';
import { usePathname } from 'next/navigation';

export function FloatingCart() {
  const { cartItems } = useCart();
  const { openOffCanvas } = useOffCanvas();
  const pathname = usePathname();
  const hasItems = cartItems.length > 0;

  // Mostrar na home, página de serviços e página de prestador
  const shouldShow = pathname === '/' || pathname.startsWith('/servicos') || pathname.startsWith('/prestador');

  if (!shouldShow || !hasItems) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={openOffCanvas}
        className="fixed bottom-6 right-6 bg-[#F71875] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-[#E6006F] transition-colors z-30"
      >
        <div className="relative">
          <MdShoppingCart className="text-2xl" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {cartItems.length}
          </span>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
