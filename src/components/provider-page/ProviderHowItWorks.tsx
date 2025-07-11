'use client';

import { motion } from 'framer-motion';
import { MdPersonAdd, MdBusiness, MdNotifications, MdMoney } from 'react-icons/md';
import Link from 'next/link';

const steps = [
  {
    number: 1,
    icon: MdPersonAdd,
    title: 'Cadastre-se Grátis',
    description: 'Crie sua conta em menos de 5 minutos e complete seu perfil profissional'
  },
  {
    number: 2,
    icon: MdBusiness,
    title: 'Configure seus Serviços',
    description: 'Adicione seus serviços, preços, fotos e área de atendimento'
  },
  {
    number: 3,
    icon: MdNotifications,
    title: 'Receba Solicitações',
    description: 'Clientes interessados entrarão em contato diretamente com você'
  },
  {
    number: 4,
    icon: MdMoney,
    title: 'Feche Negócios',
    description: 'Negocie, confirme o serviço e receba o pagamento com segurança'
  }
];

export function ProviderHowItWorks() {
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
            Como Funciona
          </h2>
          <p className="text-base md:text-lg text-[#6E5963] max-w-2xl mx-auto">
            Comece a receber pedidos em 4 passos simples
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center relative"
              >
                {/* Connector Line - Only on desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#A502CA] to-transparent transform -translate-x-1/2 z-0" />
                )}
                
                {/* Step Content */}
                <div className="relative z-10">
                  <div className="relative mb-4 md:mb-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-r from-[#A502CA] to-[#CD0067] rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-lg">
                      <Icon className="text-white text-2xl md:text-3xl" />
                    </div>
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[#A502CA]">
                      <span className="text-[#A502CA] font-bold text-xs md:text-sm">{step.number}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-[#520029] mb-3 md:mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm md:text-base text-[#6E5963] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 md:mt-12"
        >
          <Link href="/auth/register">
            <button
              className="w-full md:w-auto bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Começar Agora
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
