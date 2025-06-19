'use client';

import { motion } from 'framer-motion';
import { MdTrendingUp, MdSecurity, MdSupport, MdVisibility, MdMoney, MdSchedule } from 'react-icons/md';

const benefits = [
  {
    icon: MdTrendingUp,
    title: 'Aumente sua Receita',
    description: 'Conecte-se com mais clientes e aumente seus ganhos mensais em até 300%',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: MdVisibility,
    title: 'Maior Visibilidade',
    description: 'Apareça para milhares de clientes que procuram seus serviços na sua região',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: MdSecurity,
    title: 'Pagamento Garantido',
    description: 'Sistema seguro de pagamentos com proteção total para prestadores',
    color: 'from-purple-500 to-violet-600'
  },
  {
    icon: MdSupport,
    title: 'Suporte Dedicado',
    description: 'Equipe especializada para ajudar você a crescer e resolver qualquer dúvida',
    color: 'from-orange-500 to-red-600'
  },
  {
    icon: MdMoney,
    title: 'Sem Taxa Inicial',
    description: 'Comece grátis! Pague apenas quando fechar negócios pela plataforma',
    color: 'from-pink-500 to-rose-600'
  },
  {
    icon: MdSchedule,
    title: 'Gestão Completa',
    description: 'Dashboard intuitivo para gerenciar agenda, clientes e pagamentos',
    color: 'from-indigo-500 to-purple-600'
  }
];

export function ProviderBenefits() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#520029] mb-4">
            Por que escolher a Be Fest?
          </h2>
          <p className="text-lg text-[#6E5963] max-w-2xl mx-auto">
            Oferecemos tudo que você precisa para fazer seu negócio crescer
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-6`}>
                  <Icon className="text-white text-2xl" />
                </div>
                
                <h3 className="text-xl font-bold text-[#520029] mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-[#6E5963] leading-relaxed">
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
