'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Organizadora de eventos',
    content: 'A Be Fest transformou a forma como organizo festas! Encontrei fornecedores incríveis na minha região e economizei muito tempo. Super recomendo!',
    rating: 5,
    avatar: '👩🏻‍💼'
  },
  {
    name: 'João Santos',
    role: 'Pai de família',
    content: 'Organizei o aniversário da minha filha em poucos cliques. A variedade de opções e a qualidade dos prestadores me surpreenderam muito.',
    rating: 5,
    avatar: '👨🏻‍💼'
  },
  {
    name: 'Ana Costa',
    role: 'Empresária',
    content: 'Para eventos corporativos, a Be Fest é perfeita. Encontro tudo que preciso rapidamente e com total segurança. Excelente plataforma!',
    rating: 5,
    avatar: '👩🏻‍💼'
  }
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#520029] mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-[#6E5963] max-w-2xl mx-auto">
            Histórias reais de pessoas que tornaram suas festas inesquecíveis com a Be Fest
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-[#6E5963] leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF0080] to-[#CD0067] rounded-full flex items-center justify-center text-xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-[#520029]">{testimonial.name}</h4>
                  <p className="text-sm text-[#6E5963]">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
