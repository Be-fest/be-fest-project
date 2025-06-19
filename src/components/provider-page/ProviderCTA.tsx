'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdTrendingUp, MdSecurity, MdSupport } from 'react-icons/md';

export function ProviderCTA() {
  return (
    <section 
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ backgroundColor: '#520029' }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#A502CA] to-[#CD0067] rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-[#FF0080] to-[#E6006F] rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-[#A502CA] to-[#8B0A9E] rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Pronto para transformar seu negócio?
            </h2>
            
            <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 1.000 prestadores que já escolheram a Be Fest para crescer
            </p>

            {/* Quick Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-pink-100">
                <MdTrendingUp className="text-[#FF0080] text-xl" />
                <span>Aumento médio de 250% na receita</span>
              </div>
              <div className="flex items-center gap-2 text-pink-100">
                <MdSecurity className="text-[#FF0080] text-xl" />
                <span>100% seguro e confiável</span>
              </div>
              <div className="flex items-center gap-2 text-pink-100">
                <MdSupport className="text-[#FF0080] text-xl" />
                <span>Suporte dedicado 24/7</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#FF0080] hover:bg-[#E6006F] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Cadastrar Agora - Grátis
                </motion.button>
              </Link>
              
              <Link href="/dashboard/prestador">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white hover:bg-white hover:text-[#520029] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
                >
                  Já sou cadastrado
                </motion.button>
              </Link>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 text-pink-200 text-sm"
            >
              <p>✓ Sem compromisso • ✓ Cancele quando quiser • ✓ Suporte gratuito</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
