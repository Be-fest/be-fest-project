'use client';

import { motion } from 'framer-motion';

const stats = [
  { number: '10K+', label: 'Festas realizadas' },
  { number: '500+', label: 'Fornecedores parceiros' },
  { number: '50+', label: 'Cidades atendidas' },
  { number: '98%', label: 'Clientes satisfeitos' }
];

const values = [
  {
    icon: '🎯',
    title: 'Simplicidade',
    description: 'Tornamos o processo de organizar festas simples e intuitivo para todos.'
  },
  {
    icon: '🤝',
    title: 'Confiança',
    description: 'Conectamos você apenas com fornecedores verificados e de qualidade.'
  },
  {
    icon: '💖',
    title: 'Alegria',
    description: 'Nossa missão é levar mais momentos de felicidade para sua vida.'
  }
];

export function AboutUs() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#520029] mb-6">
              Sobre a Be Fest
            </h2>
            <p className="text-lg text-[#6E5963] leading-relaxed mb-6">
              Nascemos da paixão por conectar pessoas e criar momentos inesquecíveis. 
              A Be Fest é mais que uma plataforma - somos facilitadores de alegria, 
              unindo quem organiza festas com os melhores prestadores de serviços.
            </p>
            <p className="text-lg text-[#6E5963] leading-relaxed mb-8">
              Acreditamos que toda celebração merece ser especial, e nossa tecnologia 
              torna isso possível de forma rápida, segura e descomplicada.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-[#FF0080] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-[#6E5963]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-[#520029] mb-8">
              Nossos valores
            </h3>
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF0080] to-[#CD0067] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {value.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#520029] mb-2">
                    {value.title}
                  </h4>
                  <p className="text-[#6E5963] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
