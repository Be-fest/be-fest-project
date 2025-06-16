'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
            Sua festa num clique! Be fest,
            <span className="text-[#FF0080]"> conectando você à felicidade.</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Encontre serviços de comida e bebida na sua região e monte sua festa de forma 
            rápida, prática e segura.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              href="/categorias"
              className="inline-block bg-[#FF0080] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#E6006F] transition-colors shadow-lg"
            >
              Faça Festa!
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative w-full h-96 lg:h-[500px]">
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#FF0080] rounded-full opacity-20"></div>
            <div className="absolute top-8 right-8 w-8 h-8 bg-[#FF0080] rounded-full"></div>
            <div className="absolute bottom-12 -left-8 w-12 h-12 bg-[#FF0080] rounded-full opacity-30"></div>
            <div className="absolute -bottom-4 right-4 w-20 h-20 bg-[#FF0080] rounded-full opacity-20"></div>
            
            {/* Main illustration placeholder - you can replace this with the actual image */}
            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-[#FF0080] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-4xl">🎉</span>
                </div>
                <p className="text-gray-600 text-lg">Grupo de pessoas felizes</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
