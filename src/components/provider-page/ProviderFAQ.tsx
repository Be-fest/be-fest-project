'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MdExpandMore } from 'react-icons/md';

const faqs = [
  {
    id: 1,
    question: 'Quanto custa para ser um prestador na Be Fest?',
    answer: 'O cadastro é 100% gratuito! Você só paga uma pequena taxa quando fecha um negócio através da plataforma. No plano gratuito, a taxa é de 8% por transação.'
  },
  {
    id: 2,
    question: 'Como recebo os pagamentos dos clientes?',
    answer: 'Os pagamentos são processados de forma segura pela nossa plataforma e transferidos diretamente para sua conta bancária em até 2 dias úteis após a confirmação do serviço.'
  },
  {
    id: 3,
    question: 'Posso definir meus próprios preços?',
    answer: 'Sim! Você tem total liberdade para definir seus preços, condições de pagamento e políticas de cancelamento. A Be Fest não interfere na sua precificação.'
  },
  {
    id: 4,
    question: 'Como funciona o sistema de avaliações?',
    answer: 'Após cada evento, os clientes podem avaliar seu serviço. Avaliações positivas aumentam sua visibilidade na plataforma e ajudam a conquistar mais clientes.'
  },
  {
    id: 5,
    question: 'Preciso ter CNPJ para me cadastrar?',
    answer: 'Sim, é necessário ter CNPJ ativo para se cadastrar como prestador. Isso garante a segurança e confiabilidade da plataforma para todos os usuários.'
  },
  {
    id: 6,
    question: 'Posso cancelar minha conta a qualquer momento?',
    answer: 'Sim, você pode cancelar sua conta a qualquer momento sem custos adicionais. Seus dados serão mantidos conforme nossa política de privacidade.'
  }
];

export function ProviderFAQ() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (id: number) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

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
            Perguntas Frequentes
          </h2>
          <p className="text-base md:text-lg text-[#6E5963] max-w-2xl mx-auto">
            Tire suas dúvidas sobre como funciona para prestadores
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleQuestion(faq.id)}
                  className="w-full px-4 md:px-6 py-4 md:py-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors duration-300"
                >
                  <h3 className="font-semibold text-[#520029] pr-3 md:pr-4 text-sm md:text-base">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openQuestion === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MdExpandMore className="text-xl md:text-2xl text-[#A502CA]" />
                  </motion.div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openQuestion === faq.id ? 'auto' : 0,
                    opacity: openQuestion === faq.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 md:px-6 pb-4 md:pb-5">
                    <p className="text-[#6E5963] leading-relaxed text-sm md:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
