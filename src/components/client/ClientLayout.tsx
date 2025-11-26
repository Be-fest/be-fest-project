'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMenu, MdClose } from 'react-icons/md';
import { ClientSidebar } from './ClientSidebar';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, userData } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.log('ClientLayout: Timeout de segurança - forçando mounted');
      setMounted(true);
    }, 5000);
    
    // Close sidebar on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const userInitial = userData?.full_name ? (userData.full_name || '').charAt(0).toUpperCase() : 'U';
  
  // Função para formatar o nome completo (primeiro e último nome apenas)
  const formatDisplayName = (fullName: string | null) => {
    if (fullName) {
      const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
      if (nameParts.length >= 2) {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
      } else if (nameParts.length === 1) {
        return nameParts[0];
      }
    }
    return 'Usuário';
  };
  
  const userName = formatDisplayName(userData?.full_name || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Mobile overlay with blur effect */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always visible */}
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 w-80 z-30">
          <ClientSidebar 
            userInitial={userInitial}
            userName={userName}
            isDesktop={true}
          />
        </div>
      </div>

      {/* Mobile Sidebar - Drawer style */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 200
            }}
            className="fixed inset-y-0 left-0 w-80 z-50 lg:hidden"
          >
            <ClientSidebar 
              onClose={() => setSidebarOpen(false)}
              userInitial={userInitial}
              userName={userName}
              isDesktop={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <main className="lg:pl-80">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Left side - Mobile menu & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
                aria-label="Abrir menu"
              >
                <MdMenu className="text-xl text-gray-700" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#520029] to-[#F71875] bg-clip-text text-transparent">
                  Área do Cliente
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">Bem-vindo de volta, {userData?.full_name ? (userData.full_name || '').split(' ')[0] : 'Usuário'}!</p>
              </div>
            </div>
            {/* Right side - User info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-[#F71875] to-[#A502CA] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {userInitial}
                </div>
                <div className="hidden md:block text-sm">
                  <div className="font-medium text-gray-900">{userName}</div>
                  <div className="text-xs text-gray-500">Cliente</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/50 min-h-[calc(100vh-10rem)] sm:min-h-[calc(100vh-12rem)] overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        </div>
      </main>
    </div>
  );
}