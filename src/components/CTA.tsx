'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdCelebration, MdStar, MdRocket } from 'react-icons/md';

export function CTA() {
  return (    <section className="py-16 md:py-24 bg-gradient-to-br from-[#520029] via-[#FF0080] to-[#CD0067] relative overflow-hidden">      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-lg"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>        <motion.div 
          className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full blur-lg"
          animate={{ 
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>        <motion.div 
          className="absolute bottom-20 left-32 w-12 h-12 bg-white rounded-full blur-lg"
          animate={{ 
            y: [0, -10, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>        <motion.div 
          className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full blur-lg"
          animate={{ 
            y: [0, 25, 0],
            x: [0, -10, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        ></motion.div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-white"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Organize eventos incríveis com a Be Fest. 
            Sua festa dos sonhos está a um clique de distância!
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth/register"
                className="bg-white text-[#FF0080] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
              >
                Criar Conta Grátis
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth/register"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-[#FF0080] transition-all duration-300 inline-block"
              >
                Sou Fornecedor
              </Link>
            </motion.div>
          </div>


        </motion.div>
      </div>
    </section>
  );
}
