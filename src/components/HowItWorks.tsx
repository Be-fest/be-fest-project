'use client';

import { motion } from 'framer-motion';
import { MdSearch, MdCompare, MdHandshake, MdCelebration } from 'react-icons/md';

const steps = [
  {
    step: '01',
    title: 'Escolha sua categoria',
    description: 'Navegue pelas categorias de serviços e encontre exatamente o que precisa para sua festa.',
    icon: MdSearch
  },
  {
    step: '02',
    title: 'Compare fornecedores',
    description: 'Veja perfis detalhados, avaliações e preços de diferentes prestadores na sua região.',
    icon: MdCompare
  },
  {
    step: '03',
    title: 'Faça seu pedido',
    description: 'Entre em contato diretamente com o fornecedor e organize todos os detalhes da sua festa.',
    icon: MdHandshake
  },
  {
    step: '04',
    title: 'Celebre com alegria',
    description: 'Relaxe e aproveite sua festa perfeita, sabendo que tudo foi cuidadosamente planejado.',
    icon: MdCelebration
  }
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#520029] mb-4">
            Como funciona a Be Fest
          </h2>
          <p className="text-lg text-[#6E5963] max-w-2xl mx-auto">
            Em apenas 4 passos simples, você organiza a festa dos seus sonhos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF0080] to-[#CD0067] rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="text-3xl text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#520029] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#520029] mb-3">
                {item.title}
              </h3>
              <p className="text-[#6E5963] leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
