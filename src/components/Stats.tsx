'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const stats = [
  {
    number: 10000,
    suffix: '+',
    label: 'Eventos Realizados',
    icon: '🎉'
  },
  {
    number: 2500,
    suffix: '+',
    label: 'Fornecedores Cadastrados',
    icon: '👥'
  },
  {
    number: 50000,
    suffix: '+',
    label: 'Clientes Satisfeitos',
    icon: '😊'
  },
  {
    number: 95,
    suffix: '%',
    label: 'Taxa de Satisfação',
    icon: '⭐'
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
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#FF0080] to-[#CD0067]">
      <div className="container mx-auto px-4 md:px-6">
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
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{stat.icon}</div>
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
