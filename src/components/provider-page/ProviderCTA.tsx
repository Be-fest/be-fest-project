'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdTrendingUp, MdSecurity, MdSupport } from 'react-icons/md';

export function ProviderCTA() {
  return (
    <section 
      className="py-12 md:py-16 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor: '#520029' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#520029] to-[#8B0A9E] opacity-90"></div>

      <div className="container mx-auto px-4 md:px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6">
              Cadastre seu Negócio
            </h2>
            
            <p className="text-base md:text-lg lg:text-xl text-pink-100 mb-6 md:mb-8 max-w-2xl mx-auto">
              Disponibilize seus serviços na plataforma
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
              <Link href="/auth/register" className="w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Cadastrar-se Agora
                </motion.button>
              </Link>
              
              <Link href="/dashboard/prestador" className="w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto border-2 border-white text-white hover:bg-white hover:text-[#520029] px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg transition-all duration-300"
                >
                  Ver Dashboard
                </motion.button>
              </Link>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 md:mt-12 text-pink-200 text-xs md:text-sm"
            >
              <p>✓ Sem compromisso • ✓ Cancele quando quiser • ✓ Suporte gratuito</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p 
          className="mt-8 md:mt-12 text-pink-200 text-xs md:text-sm"
        >
          ✨ Cadastro 100% gratuito • Sem taxas de adesão
        </p>
      </div>
    </section>
  );
}
