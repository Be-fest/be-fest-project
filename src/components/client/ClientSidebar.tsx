'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MdDashboard, 
  MdCelebration, 
  MdPerson, 
  MdSettings,
  MdLogout,
  MdClose,
  MdCalendarToday,
  MdHistory,
  MdHome,
  MdArrowBack
} from 'react-icons/md';
import LogoutButton from '@/components/LogoutButton';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

interface ClientSidebarProps {
  onClose?: () => void;
  userInitial?: string;
  userName?: string;
}

export function ClientSidebar({ onClose, userInitial = 'U', userName = 'Usuário' }: ClientSidebarProps) {
  const pathname = usePathname();
  
  const menuItems: MenuItem[] = [
    {
      label: 'Visão Geral',
      icon: MdDashboard,
      path: '/perfil',
      badge: undefined
    },
    {
      label: 'Minhas Festas',
      icon: MdCelebration,
      path: '/perfil?tab=events',
      badge: undefined
    },
    {
      label: 'Configurações',
      icon: MdSettings,
      path: '/perfil?tab=settings',
      badge: undefined
    }
  ];

  const handleLinkClick = () => {
    // Fecha a sidebar em mobile quando um link é clicado
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Back to Home Button */}
      <div className="p-4 border-b border-gray-100">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group w-full"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#FF0080]/10 transition-colors">
            <MdArrowBack className="text-lg text-gray-600 group-hover:text-[#FF0080]" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-700 group-hover:text-[#FF0080]">Voltar ao Site</div>
            <div className="text-xs text-gray-500">Página inicial</div>
          </div>
        </Link>
      </div>

      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-[#FF0080] to-[#A502CA] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {userInitial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[#520029] truncate">
              {userName}
            </h1>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FF0080]/10 text-[#FF0080]">
              🎉 Cliente
            </div>
          </div>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdClose className="text-xl text-gray-600" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || 
            (item.path.includes('?tab=') && pathname === '/perfil' && 
             typeof window !== 'undefined' && window.location.search.includes(item.path.split('?tab=')[1]));
          
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleLinkClick}
              className={`
                flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-[#FF0080] to-[#A502CA] text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-[#FF0080]/5 hover:to-[#A502CA]/5 hover:text-[#FF0080]'
                }
              `}
            >
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-[#FF0080]/10'
              }`}>
                <Icon className={`text-xl ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-600 group-hover:text-[#FF0080]'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${
                  isActive ? 'text-white' : ''
                }`}>
                  {item.label}
                </div>
                <div className={`text-xs truncate ${
                  isActive 
                    ? 'text-white/70' 
                    : 'text-gray-500'
                }`}>
                  {item.label === 'Visão Geral' && 'Dashboard principal'}
                  {item.label === 'Minhas Festas' && 'Gerencie seus eventos'}
                  {item.label === 'Configurações' && 'Ajustar preferências'}
                </div>
              </div>
              {item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#FF0080] text-white'
                  }`}
                >
                  {item.badge}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>



      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="w-full">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
} 