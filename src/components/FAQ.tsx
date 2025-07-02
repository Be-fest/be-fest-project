'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MdExpandMore } from 'react-icons/md';

const faqs = [
	{
		question: 'Como funciona a Be Fest?',
		answer: 'A Be Fest conecta você aos melhores prestadores de serviços para festas. Você escolhe a categoria, compara opções e contrata diretamente através da nossa plataforma.'
	},
	{
		question: 'Os prestadores são verificados?',
		answer: 'Sim! Todos os prestadores passam por um processo rigoroso de verificação, incluindo documentação, referências e avaliações de clientes anteriores.'
	},
	{
		question: 'Posso cancelar minha festa?',
		answer: 'Sim, você pode cancelar sua festa respeitando os termos acordados com cada prestador. Recomendamos verificar as políticas de cancelamento de cada serviço antes da contratação.'
	},
	{
		question: 'Como funciona o pagamento?',
		answer: 'O pagamento é feito de forma segura através da nossa plataforma. Aceitamos cartões de crédito, débito e PIX. O valor só é liberado para o prestador após a confirmação do serviço.'
	},
	{
		question: 'E se algo der errado no dia da festa?',
		answer: 'Temos um suporte dedicado para emergências no dia do evento. Nossa equipe está disponível 24h para resolver qualquer imprevisto e garantir que sua festa seja um sucesso.'
	}
];

export function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="py-16 md:py-24 bg-white">
			<div className="container mx-auto px-4 md:px-6">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12 md:mb-16"
				>
					<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#520029] mb-4">
						Perguntas Frequentes
					</h2>
					<p className="text-base md:text-lg text-[#6E5963] max-w-2xl mx-auto">
						Tire suas dúvidas sobre como funciona a Be Fest
					</p>
				</motion.div>

				<div className="max-w-3xl mx-auto">
					{faqs.map((faq, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							className="mb-4 bg-gray-50 rounded-xl overflow-hidden"
						>
							<button
								onClick={() => toggleFAQ(index)}
								className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
							>
								<h3 className="text-sm sm:text-base md:text-lg font-semibold text-[#520029] pr-4">
									{faq.question}
								</h3>
								<MdExpandMore 
									className={`text-xl sm:text-2xl text-[#520029] transition-transform duration-300 flex-shrink-0 ${
										openIndex === index ? 'rotate-180' : ''
									}`}
								/>
							</button>
							
							<AnimatePresence>
								{openIndex === index && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: 'auto', opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.3 }}
										className="overflow-hidden"
									>
										<div className="px-4 sm:px-6 pb-4 sm:pb-5">
											<p className="text-sm sm:text-base text-[#6E5963] leading-relaxed">
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
		</section>
	);
}
