'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MdDashboard, 
  MdCelebration, 
  MdPerson, 
  MdSettings,
  MdClose,
  MdArrowBack,
} from 'react-icons/md';
import LogoutButton from '@/components/LogoutButton';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description?: string;
}

interface ClientSidebarProps {
  onClose?: () => void;
  userInitial?: string;
  userName?: string;
  isDesktop?: boolean;
}

export function ClientSidebar({ 
  onClose, 
  userInitial = 'U', 
  userName = 'Usuário',
  isDesktop = false
}: ClientSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: MdDashboard,
      path: '/dashboard',
      description: 'Visão geral'
    },
    {
      label: 'Minhas Festas',
      icon: MdCelebration,
      path: '/perfil?tab=minhas-festas',
      description: 'Gerencie eventos'
    },
    {
      label: 'Configurações',
      icon: MdSettings,
      path: '/perfil?tab=configuracoes',
      description: 'Preferências'
    }
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 200,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <motion.aside
      initial={isDesktop ? "visible" : "hidden"}
      animate="visible"
      exit="hidden"
      variants={sidebarVariants}
      className={`
        w-80 bg-white shadow-xl h-full flex flex-col
        ${isDesktop ? 'border-r border-gray-200' : 'shadow-2xl'}
      `}
    >
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#520029] to-[#F71875] text-white relative">
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-all duration-200"
            aria-label="Fechar menu"
          >
            <MdClose className="text-xl" />
          </button>
        )}

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {userInitial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{userName}</h2>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Cliente
            </span>
          </div>
        </div>
      </div>

      {/* Back to Home Button */}
      <div className="p-4 border-b border-gray-100">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group w-full"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 group-hover:bg-[#F71875]/10 transition-all duration-200">
            <MdArrowBack className="text-lg text-gray-600 group-hover:text-[#F71875]" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 group-hover:text-[#F71875] transition-colors">
              Voltar ao Site
            </div>
            <div className="text-xs text-gray-500">Página inicial</div>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            
            // Verificar se é o item ativo considerando path e query params
            let isActive = false;
            const [itemPath, itemQuery] = item.path.split('?');
            
            if (pathname === itemPath) {
              if (itemQuery) {
                const itemTab = new URLSearchParams(itemQuery).get('tab');
                const currentTab = searchParams.get('tab');
                isActive = itemTab === currentTab;
              } else {
                // Se não tem query param, é ativo quando não há tab ou tab é null
                isActive = !searchParams.get('tab');
              }
            }
            
            return (
              <motion.div
                key={item.path}
                variants={itemVariants}
                initial={isDesktop ? "visible" : "hidden"}
                animate="visible"
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#F71875] to-[#A502CA] text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#F71875]'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 group-hover:bg-[#F71875]/10'
                    }
                  `}>
                    <Icon className={`
                      text-xl
                      ${isActive 
                        ? 'text-white' 
                        : 'text-gray-600 group-hover:text-[#F71875]'
                      }
                    `} />
                  </div>
                  
                  <div className="flex-1">
                    <div className={`
                      font-semibold
                      ${isActive ? 'text-white' : ''}
                    `}>
                      {item.label}
                    </div>
                    <div className={`
                      text-sm
                      ${isActive 
                        ? 'text-white/80' 
                        : 'text-gray-500 group-hover:text-gray-600'
                      }
                    `}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <LogoutButton />
      </div>
    </motion.aside>
  );
} 