'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MdCelebration, MdGroups, MdStar } from 'react-icons/md';
import { RiEmotionHappyFill } from "react-icons/ri";

const stats = [
  {
    number: 10000,
    suffix: '+',
    label: 'Eventos Realizados',
    icon: MdCelebration
  },
  {
    number: 2500,
    suffix: '+',
    label: 'Fornecedores Cadastrados',
    icon: MdGroups
  },
  {
    number: 50000,
    suffix: '+',
    label: 'Clientes Satisfeitos',
    icon: RiEmotionHappyFill
  },
  {
    number: 95,
    suffix: '%',
    label: 'Taxa de Satisfação',
    icon: MdStar
  }
];

function CountUp({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export function Stats() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#FF0080] to-[#CD0067] relative overflow-hidden">      {/* Animated Background Elements */}
      <div className="absolute inset-0">        <motion.div 
          className="absolute top-10 left-10 w-16 h-16 bg-white/20 rounded-full blur-md"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>        <motion.div 
          className="absolute top-20 right-20 w-12 h-12 bg-white/20 rounded-full blur-md"
          animate={{ 
            x: [0, 15, 0],
            y: [0, -10, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>        <motion.div 
          className="absolute bottom-32 left-1/4 w-20 h-20 bg-white/20 rounded-full blur-lg"
          animate={{ 
            scale: [1, 0.8, 1.2, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>        <motion.div 
          className="absolute bottom-10 right-32 w-14 h-14 bg-white/20 rounded-full blur-md"
          animate={{ 
            y: [0, 25, 0],
            x: [0, -20, 0]
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
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Números que Impressionam
          </h2>
          <p className="text-lg text-pink-100 max-w-2xl mx-auto">
            A Be Fest é a plataforma líder em organização de eventos no Brasil
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}              className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
            >
              <stat.icon className="text-4xl mb-4 mx-auto text-white" />
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                <CountUp end={stat.number} suffix={stat.suffix} />
              </div>
              <p className="text-pink-100 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
