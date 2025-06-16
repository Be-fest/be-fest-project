'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MdExpandMore } from 'react-icons/md';

const faqs = [
  {
    id: 1,
    question: 'Como funciona a Be Fest?',
    answer: 'A Be Fest é uma plataforma que conecta você aos melhores fornecedores de serviços para eventos. Você escolhe a categoria do serviço, compara fornecedores, vê avaliações e contrata diretamente com total segurança.'
  },
  {
    id: 2,
    question: 'É grátis para usar a plataforma?',
    answer: 'Sim! Para clientes, a plataforma é 100% gratuita. Você pode navegar, comparar fornecedores e entrar em contato sem nenhum custo. Os fornecedores pagam uma pequena taxa apenas quando fecham um negócio.'
  },
  {
    id: 3,
    question: 'Como são selecionados os fornecedores?',
    answer: 'Todos os fornecedores passam por um processo rigoroso de verificação. Checamos documentos, referências, portfolio e mantemos um sistema de avaliações dos clientes para garantir apenas profissionais de qualidade.'
  },
  {
    id: 4,
    question: 'Posso cancelar um serviço contratado?',
    answer: 'Sim, você pode cancelar conforme os termos acordados com o fornecedor. Recomendamos sempre ler as políticas de cancelamento antes de contratar e manter uma comunicação clara com o prestador de serviço.'
  },
  {
    id: 5,
    question: 'A Be Fest atende em quais cidades?',
    answer: 'Atualmente atendemos em mais de 50 cidades brasileiras, com foco nas principais capitais e regiões metropolitanas. Estamos sempre expandindo nossa cobertura para atender mais clientes.'
  },
  {
    id: 6,
    question: 'Como posso me tornar um fornecedor?',
    answer: 'É fácil! Clique em "Cadastrar-se" e escolha a opção "Prestador de serviços". Preencha seus dados, envie sua documentação e aguarde nossa verificação. Após aprovado, você já pode receber pedidos.'
  },
  {
    id: 7,
    question: 'Os preços são fixos ou posso negociar?',
    answer: 'Você pode negociar diretamente com os fornecedores. Muitos têm preços flexíveis dependendo do tamanho do evento, data e outros fatores. Use nossa plataforma para iniciar a conversa.'
  },
  {
    id: 8,
    question: 'Como funciona o pagamento?',
    answer: 'O pagamento é feito diretamente com o fornecedor, conforme acordado entre vocês. A Be Fest não processa pagamentos, garantindo mais flexibilidade nas negociações.'
  }
];

export function FAQ() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (id: number) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };  return (
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
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-[#6E5963] max-w-2xl mx-auto">
            Tire suas dúvidas sobre como usar a Be Fest para organizar eventos incríveis
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <button
                  onClick={() => toggleQuestion(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors duration-300"
                >
                  <h3 className="font-semibold text-[#520029] pr-4">
                    {faq.question}
                  </h3>                  <motion.div
                    animate={{ rotate: openQuestion === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <MdExpandMore className="text-2xl text-[#FF0080]" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openQuestion === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5">
                        <p className="text-[#6E5963] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-[#FF0080] to-[#CD0067] rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ainda tem dúvidas?
            </h3>
            <p className="text-pink-100 mb-6 max-w-md mx-auto">
              Nossa equipe está pronta para ajudar você a organizar o evento perfeito
            </p>
            <button className="bg-white text-[#FF0080] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300">
              Fale Conosco
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
