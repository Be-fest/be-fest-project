'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdMenu } from 'react-icons/md';
import Link from 'next/link';

const routes = [
  {
    title: 'Páginas Principais',
    routes: [
      { name: 'Home', path: '/' },
      { name: 'Serviços', path: '/servicos' },
      { name: 'Prestadores', path: '/prestadores' },
    ]
  },
  {
    title: 'Área do Cliente',
    routes: [
      { name: 'Minhas Festas', path: '/minhas-festas' },
      { name: 'Detalhes da Festa', path: '/minhas-festas/1' },
      { name: 'Pagamento', path: '/pagamento' },
    ]
  },
  {
    title: 'Área do Prestador',
    routes: [
      { name: 'Dashboard', path: '/dashboard/prestador' },
      { name: 'Perfil do Prestador', path: '/prestador/1' },
      { name: 'Seja um Prestador', path: '/prestadores' },
    ]
  },
  {
    title: 'Autenticação',
    routes: [
      { name: 'Login', path: '/auth/login' },
      { name: 'Cadastro', path: '/auth/register' },
    ]
  },
  {
    title: 'Área Administrativa',
    routes: [
      { name: 'Dashboard Admin', path: '/admin' },
      { name: 'Pedidos', path: '/admin/pedidos' },
      { name: 'Clientes', path: '/admin/clientes' },
      { name: 'Prestadores', path: '/admin/prestadores' },
    ]
  }
];

export function RoutesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão de toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-[#F71875] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-[#E6006F] transition-colors"
      >
        <MdMenu className="text-2xl" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 backdrop-blur-md bg-white/20 z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#520029]">Rotas do Site</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MdClose className="text-2xl text-gray-600" />
                  </button>
                </div>

                <div className="space-y-8">
                  {routes.map((section) => (
                    <div key={section.title} className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#F71875]">
                        {section.title}
                      </h3>
                      <div className="grid gap-2">
                        {section.routes.map((route) => (
                          <Link
                            key={route.path}
                            href={route.path}
                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between text-gray-700 hover:text-[#F71875]"
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{route.name}</span>
                            <span className="text-sm text-gray-500">{route.path}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Este modal é apenas para apresentação e deve ser removido após a demonstração.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Nota: O botão "New Fest" abre um modal de carrinho e não é uma rota separada.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 