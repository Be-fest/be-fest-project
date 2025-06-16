'use client';

import { motion } from 'framer-motion';
import { Button } from './ui';
import Image from 'next/image';

export function Hero() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/be-fest-client-logo.png"
              alt="Be Fest Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <nav className="flex items-center gap-8">
            <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">Cardápios</a>
            <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">New Fest</a>
            <a href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">Cardápios</a>
          </nav>
        </div>
      </header>

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Sua festa num clique! Be fest,{' '}
              <span className="text-gray-900">conectando você à felicidade.</span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Encontre serviços de comida e bebida na sua região e monte sua festa de forma rápida, prática e segura.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button 
                style={{ backgroundColor: '#FF0080' }}
                className="text-white px-8 py-3 text-base font-medium rounded-lg hover:opacity-90 transition-all duration-300"
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
            <div className="relative w-full max-w-md">
              <Image
                src="/hero-img.png"
                alt="Pessoas felizes em uma festa - Be Fest conectando você à felicidade"
                width={500}
                height={400}
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
