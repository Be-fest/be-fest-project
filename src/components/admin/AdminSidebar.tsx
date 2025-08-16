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
import { getEventServicesCountsAction } from '@/lib/actions/admin';

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
  
  const [ordersBadge, setOrdersBadge] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Load real counts for orders to display in the badge
    let isMounted = true;
    (async () => {
      const res = await getEventServicesCountsAction();
      if (!isMounted) return;
      if (res.success && res.data) {
        setOrdersBadge(res.data.total > 0 ? String(res.data.total) : undefined);
      } else {
        setOrdersBadge(undefined);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

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
      badge: ordersBadge
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
        width: isCollapsed ? 80 : 280 
      }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeInOut' 
      }}
      className="bg-white shadow-xl h-full flex flex-col relative overflow-hidden"
      style={{
        minWidth: isCollapsed ? '80px' : '280px',
        maxWidth: isCollapsed ? '80px' : '280px'
      }}
    >
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between min-h-[80px]">
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 w-full"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF4DA6] to-[#A502CA] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-[#520029] truncate">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-500 truncate">Be Fest</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-10 h-10 bg-gradient-to-br from-[#FF4DA6] to-[#A502CA] rounded-xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-lg">A</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
          title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
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
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            title="Fechar menu"
          >
            <MdClose className="text-xl text-gray-600" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 lg:p-6 space-y-2 overflow-y-auto overflow-x-hidden">
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
                  flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 flex-shrink-0
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
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
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
                      className="bg-[#A502CA] text-white text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
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
      <div className="p-4 lg:p-6 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
            text-red-600 hover:bg-red-50 hover:text-red-700
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Sair' : ''}
        >
          <MdLogout className="text-xl flex-shrink-0" />
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}