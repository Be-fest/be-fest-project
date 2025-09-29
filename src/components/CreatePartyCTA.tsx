'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { goToCreateParty, trackCreatePartyClick } from '@/utils/navigationHelpers';

export function CreatePartyCTA() {
  const router = useRouter();
  const { user } = useAuth();

  const handleCreatePartyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackCreatePartyClick('home_cta');
    goToCreateParty(router, !!user);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Título */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pronto para planejar sua festa?
          </h2>
          
          {/* Subtítulo */}
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crie sua festa de forma rápida, prática e segura. Encontre os melhores prestadores da sua região em poucos cliques.
          </p>
          
          {/* Botão CTA */}
          <motion.button
            onClick={handleCreatePartyClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FF0080] hover:bg-[#E6006F] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#FF0080] focus:ring-opacity-30 font-poppins"
            aria-label="Criar minha festa - Começar planejamento"
          >
            Criar minha festa
          </motion.button>
          
          {/* Indicadores de benefícios */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Gratuito para criar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Processo simples</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Prestadores verificados</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}