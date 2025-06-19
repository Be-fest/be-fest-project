'use client';

import { motion } from 'framer-motion';
import { MdStar } from 'react-icons/md';

const testimonials = [
  {
    name: 'João Barreto',
    business: "Barreto's Buffet",
    rating: 5,
    comment: 'Desde que entrei na Be Fest, minha receita aumentou 250%. A plataforma é intuitiva e o suporte é excepcional.',
    image: '/images/testimonials/provider1.jpg',
    growth: '+250% receita'
  },
  {
    name: 'Maria Santos',
    business: 'Decorações Elegante',
    rating: 5,
    comment: 'Melhor decisão que tomei para meu negócio. Agora tenho agenda cheia e clientes qualificados.',
    image: '/images/testimonials/provider2.jpg',
    growth: '+180% clientes'
  },
  {
    name: 'Carlos Silva',
    business: 'DJ Carlos Mix',
    rating: 5,
    comment: 'A Be Fest me conectou com clientes que jamais teria acesso. Recomendo para todos os prestadores.',
    image: '/images/testimonials/provider3.jpg',
    growth: '+320% eventos'
  }
];

export function ProviderTestimonials() {
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
            O que nossos Prestadores dizem
          </h2>
          <p className="text-lg text-[#6E5963] max-w-2xl mx-auto">
            Histórias reais de crescimento e sucesso na nossa plataforma
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <MdStar key={i} className="text-yellow-400 text-xl" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-[#6E5963] leading-relaxed mb-6 italic">
                "{testimonial.comment}"
              </p>

              {/* Provider Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#A502CA] to-[#CD0067] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#520029]">{testimonial.name}</h4>
                  <p className="text-sm text-[#6E5963]">{testimonial.business}</p>
                </div>
              </div>

              {/* Growth Badge */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="inline-block bg-gradient-to-r from-[#A502CA] to-[#CD0067] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {testimonial.growth}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
