'use client';

import { motion } from 'framer-motion';
import { Button } from './ui';
import Image from 'next/image';
import { Header } from './Header';

export function Hero() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Content */}
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 flex justify-start items-start flex-col"
          >
            <h1 className="text-4xl lg:text-5xl font-medium text-[#520029] leading-tight">
              Sua festa num clique! Be fest,{' '}
              <span className="text-[#520029]">conectando você à felicidade.</span>
            </h1>
            
            <p className="text-2xl text-[#6E5963] leading-relaxed max-w-lg">
              Encontre serviços de comida e bebida na sua região e monte sua festa de forma rápida, prática e segura.
            </p>
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button 
                style={{ 
                  background: 'linear-gradient(180deg, #FF0080 0%, #CD0067 100%)'
                }}
                className="text-white px-24 py-6 text-xl font-sans rounded-lg hover:opacity-90 transition-all duration-300"
              >
                New Fest
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-center"
          >
            <div className="relative w-full">
              <Image
                src="/hero-img.png"
                alt="Pessoas felizes em uma festa - Be Fest conectando você à felicidade"
                width={1000}
                height={800}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
