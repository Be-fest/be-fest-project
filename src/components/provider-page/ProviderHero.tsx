'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdStar, MdTrendingUp, MdAttachMoney } from 'react-icons/md';
import Image from 'next/image';

export function ProviderHero() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#FFF9F9' }}
    >
      <div className="container mx-auto pt-24 md:pt-0 px-4 md:px-6 md:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight"
            >
              <span className="text-[#520029]">Cadastre Seu Negócio</span>
              <br />
              <span className="bg-gradient-to-r from-[#A502CA] to-[#CD0067] bg-clip-text text-transparent">
                de Eventos
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-[#6E5963] mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Disponibilize seus serviços para clientes que procuram prestadores na sua região.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center lg:justify-start"
            >
              <Link href="/auth/register" className="w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Começar Agora - Grátis
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto border-2 border-[#A502CA] text-[#A502CA] hover:bg-[#A502CA] hover:text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg transition-all duration-300"
              >
                Ver Como Funciona
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 lg:mt-0 flex justify-center"
          >
            <Image
              src="/hero-prestadorimg.png"
              alt="Prestador de Serviços"
              width={500}
              height={500}
              className="w-full h-auto max-w-sm md:max-w-md lg:max-w-lg"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
              
             
