'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Footer() {
  return (
    <motion.footer 
      className="bg-gray-900 text-white py-12 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#FF0080]">Be Fest</h3>
            <p className="text-gray-400">
              Conectando você à felicidade através da organização perfeita de eventos.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Categorias</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/categoria/comida-bebida" className="hover:text-[#FF0080] transition-colors">Comida e Bebida</Link></li>
              <li><Link href="/categoria/entretenimento" className="hover:text-[#FF0080] transition-colors">Entretenimento</Link></li>
              <li><Link href="/categoria/decoracao" className="hover:text-[#FF0080] transition-colors">Decoração</Link></li>
              <li><Link href="/categoria/musica" className="hover:text-[#FF0080] transition-colors">Música</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Empresa</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/sobre" className="hover:text-[#FF0080] transition-colors">Sobre nós</Link></li>
              <li><Link href="/contato" className="hover:text-[#FF0080] transition-colors">Contato</Link></li>
              <li><Link href="/parceiros" className="hover:text-[#FF0080] transition-colors">Seja um Parceiro</Link></li>
              <li><Link href="/ajuda" className="hover:text-[#FF0080] transition-colors">Ajuda</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contato</h4>
            <ul className="space-y-2 text-gray-400">
              <li>contato@befest.com.br</li>
              <li>(11) 9999-9999</li>
              <li>São Paulo, SP</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Be Fest. Todos os direitos reservados.</p>
        </div>
      </div>
    </motion.footer>
  );
}
