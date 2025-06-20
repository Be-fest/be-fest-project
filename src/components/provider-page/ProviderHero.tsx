'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdStar, MdTrendingUp, MdAttachMoney } from 'react-icons/md';

export function ProviderHero() {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#FFF9F9' }}
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block bg-gradient-to-r from-[#A502CA] to-[#CD0067] text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              ✨ Seja um Prestador Be Fest
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: '#520029' }}
            >
              Sua festa num clique! Be fest,{' '}
              <span className="bg-gradient-to-r from-[#A502CA] to-[#FF0080] bg-clip-text text-transparent">
                conectando você à felicidade.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg md:text-xl text-[#6E5963] mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Acompanhe o andamento de todos os eventos, cadastros e pagamentos.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8"
            >
              <div className="flex items-center gap-2">
                <MdStar className="text-[#A502CA] text-xl" />
                <span className="text-[#520029] font-semibold">+1000 Prestadores</span>
              </div>
              <div className="flex items-center gap-2">
                <MdTrendingUp className="text-[#A502CA] text-xl" />
                <span className="text-[#520029] font-semibold">95% Satisfação</span>
              </div>
              <div className="flex items-center gap-2">
                <MdAttachMoney className="text-[#A502CA] text-xl" />
                <span className="text-[#520029] font-semibold">Sem Taxa Inicial</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Cadastrar-se Agora
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-[#A502CA] text-[#A502CA] hover:bg-[#A502CA] hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300"
              >
                Ver Como Funciona
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative flex justify-center"
          >
            <img
              src="/hero-prestadorimg.png"
              alt="Prestadores Be Fest"
              className="w-full h-auto max-w-lg"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
              
             
