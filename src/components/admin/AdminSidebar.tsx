'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { 
  MdDashboard, 
  MdReceipt, 
  MdPeople, 
  MdBusinessCenter,
  MdLogout,
  MdClose,
  MdMenu,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isSuperAdmin } = useSuperAdmin();
  
  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: MdDashboard,
      path: '/admin',
      badge: undefined
    },
    {
      label: 'Pedidos',
      icon: MdReceipt,
      path: '/admin/pedidos',
      badge: '12'
    },
    {
      label: 'Clientes',
      icon: MdPeople,
      path: '/admin/clientes',
      badge: undefined
    },
    {
      label: 'Prestadores',
      icon: MdBusinessCenter,
      path: '/admin/prestadores',
      badge: undefined
    }
  ];



  const handleLogout = async () => {
    try {
      const { performLogout } = await import('@/lib/logout');
      await performLogout('admin_sidebar');
    } catch (error) {
      console.error('Erro durante logout do admin sidebar:', error);
      // Fallback
      window.location.href = '/auth/login?reason=general_error';
    }
  };

  const handleLinkClick = () => {
    // Fecha a sidebar em mobile quando um link é clicado
    if (onClose) {
      onClose();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? '80px' : '280px' 
      }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeInOut' 
      }}
      className={`
        bg-white shadow-xl h-full flex flex-col relative
        ${isCollapsed ? 'w-20' : 'w-[280px]'}
      `}
    >
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF4DA6] to-[#A502CA] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#520029]">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-500">Be Fest</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-10 h-10 bg-gradient-to-br from-[#FF4DA6] to-[#A502CA] rounded-xl flex items-center justify-center mx-auto"
            >
              <span className="text-white font-bold text-lg">A</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <MdChevronRight className="text-xl text-gray-600" />
          ) : (
            <MdChevronLeft className="text-xl text-gray-600" />
          )}
        </button>

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
      <nav className="flex-1 p-4 lg:p-6 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                PRINCIPAL
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleLinkClick}
              className={`
                group relative flex items-center p-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-[#FF4DA6] to-[#A502CA] text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#A502CA]'
                }
                ${isCollapsed ? 'justify-center' : 'justify-between'}
              `}
            >
              <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-[#A502CA]/10'
                  }
                `}>
                  <Icon className={`
                    text-xl transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-[#A502CA]'}
                  `} />
                </div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="font-medium text-sm">{item.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {item.badge && (
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#A502CA] text-white text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 bg-[#A502CA] text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 lg:p-6 border-t border-gray-100">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                CONFIGURAÇÕES
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        <button
          onClick={handleLogout}
          className={`
            group relative w-full flex items-center p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200
            ${isCollapsed ? 'justify-center' : 'gap-4'}
          `}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-all duration-200">
            <MdLogout className="text-xl text-gray-600 group-hover:text-red-600 transition-colors duration-200" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 text-left"
              >
                <span className="font-medium text-sm">Sair</span>
                <p className="text-xs text-gray-500 group-hover:text-red-500 transition-colors duration-200">
                  Fazer logout do sistema
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
              Sair
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
} 