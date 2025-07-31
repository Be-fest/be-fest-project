'use client';

import { motion } from 'framer-motion';
import { MdSearch, MdMessage, MdCelebration } from 'react-icons/md';

const steps = [
	{
		icon: MdSearch,
		title: 'Busque',
		description: 'Navegue por diversos prestadores e serviços variados.',
		color: '#FF0080'
	},
	{
		icon: MdMessage,
		title: 'Monte sua Festa',
		description: 'Adicione os serviços dos prestadores a sua festa.',
		color: '#A502CA'
	},
	{
		icon: MdCelebration,
		title: 'Celebre',
		description: 'Aproveite a festa com os Serviços contratados na Be fest!',
		color: '#520029'
	}
];

export function HowItWorks() {
	return (
		<section className="py-16 md:py-24" style={{ backgroundColor: '#F8F9FA' }}>
			<div className="container mx-auto px-4 md:px-6">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12 md:mb-16"
				>
					<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#520029] mb-4">
						Como funciona?
					</h2>
					<p className="text-base md:text-lg text-[#6E5963] max-w-2xl mx-auto">
						Organizar sua festa nunca foi tão fácil. Siga estes 3 passos simples
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
					{steps.map((step, index) => (
						<motion.div
							key={step.title}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: index * 0.2 }}
							className="text-center group"
						>
							<div
								className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
								style={{ backgroundColor: step.color }}
							>
								<step.icon className="text-2xl md:text-3xl text-white" />
							</div>
							
							<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-[#520029] mb-3 md:mb-4">
								{index + 1}. {step.title}
							</h3>
							
							<p className="text-sm md:text-base text-[#6E5963] leading-relaxed px-2">
								{step.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
