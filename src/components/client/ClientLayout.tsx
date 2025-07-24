'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMenu, MdClose, MdNotifications } from 'react-icons/md';
import { ClientSidebar } from './ClientSidebar';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, userData, loading, error } = useOptimizedAuth();

  // Efeito para montar o componente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Efeito para controlar o scroll do body
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

  // Efeito para fechar sidebar com tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Não renderizar nada até o componente estar montado
  if (!mounted) {
    return null;
  }

  // Mostrar loading apenas durante a autenticação inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F71875] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro de autenticação se houver
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#A502CA] text-white px-6 py-2 rounded-lg hover:bg-[#8B0A9E] transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const userInitial = userData?.full_name ? userData.full_name.charAt(0).toUpperCase() : 
                     user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userName = userData?.full_name || user?.email?.split('@')[0] || 'Usuário';

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
      <div className="lg:ml-80 min-h-screen">
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#520029] to-[#F71875] bg-clip-text text-transparent">
                  Área do Cliente
                </h1>
                <p className="text-sm text-gray-500">Bem-vindo de volta, {userName.split(' ')[0]}!</p>
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
        <main className="relative">
          {/* Content Wrapper */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-6xl mx-auto"
            >
              {/* Content Area with better spacing */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 min-h-[calc(100vh-12rem)] overflow-hidden">
                <div className="p-8">
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
    </div>
  );
} 