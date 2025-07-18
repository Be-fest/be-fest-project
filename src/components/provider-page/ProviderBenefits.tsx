'use client';

import { motion } from 'framer-motion';
import { MdTrendingUp, MdSecurity, MdSupport, MdVisibility, MdMoney, MdSchedule } from 'react-icons/md';

const benefits = [
  {
    icon: MdVisibility,
    title: 'Visibilidade Online',
    description: 'Seu negócio disponível para clientes na região',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: MdSchedule,
    title: 'Gestão Simples',
    description: 'Dashboard para gerenciar seus serviços e agenda',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    icon: MdSupport,
    title: 'Suporte Técnico',
    description: 'Equipe de suporte para dúvidas sobre a plataforma',
    color: 'from-orange-500 to-red-600'
  }
];

export function ProviderBenefits() {
  return (
    <section className="py-12 md:py-16 lg:py-24" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="container mx-auto px-4 md:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#520029] mb-3 md:mb-4">
            Por que escolher a Be Fest?
          </h2>
          <p className="text-base md:text-lg text-[#6E5963] max-w-2xl mx-auto">
            Descubra todos os benefícios de ser um prestador Be Fest
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 border border-gray-100"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4 md:mb-6`}>
                  <Icon className="text-white text-xl md:text-2xl" />
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-[#520029] mb-3 md:mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-sm md:text-base text-[#6E5963] leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
