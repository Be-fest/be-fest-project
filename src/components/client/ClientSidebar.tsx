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
  MdHistory
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
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FF0080] rounded-full flex items-center justify-center text-white font-bold">
            {userInitial}
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#520029]">
              {userName}
            </h1>
            <p className="text-sm text-gray-500">Cliente</p>
          </div>
        </div>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdClose className="text-xl text-gray-600" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
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
                flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-[#FF0080] text-white font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#FF0080]'
                }
              `}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Icon className="text-lg sm:text-xl flex-shrink-0" />
                <span className="text-sm sm:text-base truncate">{item.label}</span>
              </div>
              {item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-[#FF0080] text-white text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2"
                >
                  {item.badge}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>



      {/* Logout */}
      <div className="p-3 sm:p-4 border-t border-gray-100">
        <div className="w-full">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
} 