'use client';

import { motion } from 'framer-motion';
import { MdCheck, MdStar } from 'react-icons/md';

const plans = [
  {
    name: 'Básico',
    price: 'Grátis',
    period: 'para sempre',
    description: 'Perfeito para começar',
    features: [
      'Cadastro gratuito',
      'Até 3 serviços',
      'Perfil básico',
      'Suporte por email',
      'Taxa de 8% por transação'
    ],
    popular: false,
    color: 'border-gray-200'
  },
  {
    name: 'Profissional',
    price: 'R$ 29',
    period: '/mês',
    description: 'Para prestadores ativos',
    features: [
      'Serviços ilimitados',
      'Perfil destacado',
      'Analytics detalhado',
      'Suporte prioritário',
      'Taxa de 5% por transação',
      'Badge de verificado'
    ],
    popular: true,
    color: 'border-[#A502CA]'
  },
  {
    name: 'Premium',
    price: 'R$ 79',
    period: '/mês',
    description: 'Para grandes negócios',
    features: [
      'Tudo do Profissional',
      'Posição premium nos resultados',
      'Gerente de conta dedicado',
      'Taxa de 3% por transação',
      'API personalizada',
      'Relatórios avançados'
    ],
    popular: false,
    color: 'border-gray-200'
  }
];

export function ProviderPricing() {
  return (
    <section className="py-12 md:py-16 lg:py-24" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container mx-auto px-4 md:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#520029] mb-3 md:mb-4">
            Planos e Preços
          </h2>
          <p className="text-base md:text-lg text-[#6E5963] max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 border-2 ${plan.color} ${
                plan.popular ? 'transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#A502CA] to-[#CD0067] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center gap-1">
                    <MdStar className="text-yellow-300 text-sm md:text-base" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-[#520029] mb-2">{plan.name}</h3>
                <p className="text-sm md:text-base text-[#6E5963] mb-3 md:mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-[#A502CA]">{plan.price}</span>
                  <span className="text-sm md:text-base text-[#6E5963]">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <MdCheck className="text-green-500 text-lg md:text-xl flex-shrink-0" />
                    <span className="text-sm md:text-base text-[#6E5963]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold text-sm md:text-base transition-colors ${
                  plan.popular
                    ? 'bg-[#A502CA] text-white hover:bg-[#8B0A9E]'
                    : 'bg-gray-100 text-[#520029] hover:bg-gray-200'
                }`}
              >
                {plan.name === 'Básico' ? 'Começar Grátis' : 'Escolher Plano'}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 md:mt-12"
        >
          <p className="text-sm md:text-base text-[#6E5963]">
            💡 <strong>Dica:</strong> Todos os planos incluem 30 dias de teste grátis do Premium
          </p>
        </motion.div>
      </div>
    </section>
  );
}
