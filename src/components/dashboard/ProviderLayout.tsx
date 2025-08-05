'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMenu, MdClose, MdLogout, MdHome, MdPerson, MdWarning } from 'react-icons/md';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { useAuth } from '@/hooks/useAuth';

interface ProviderLayoutProps {
  children: React.ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { userData, signOut } = useAuth();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      console.log('🔴 Iniciando logout do ProviderLayout...');
      
      // Usar a função signOut do useAuth para garantir consistência
      await signOut();
      
    } catch (error) {
      console.error('❌ Erro durante logout do provider layout:', error);
      // Mesmo com erro, forçar redirecionamento
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login?reason=provider_layout_error');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLogoutModal) {
        setShowLogoutModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showLogoutModal]);

  // Fechar modal clicando fora
  const handleModalBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setShowLogoutModal(false);
    }
  };

  // Controlar scroll do body quando modal estiver aberto
  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLogoutModal]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/prestador">
                <ProviderLogo 
                  width={40} 
                  height={40} 
                />
              </Link>
              <span className="ml-3 text-lg font-semibold text-purple-900">
                Dashboard do Prestador
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/"
                className="text-gray-600 hover:text-[#A502CA] transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <MdHome />
                <span className="hidden lg:inline">Ir para site</span>
              </Link>
              
              <div className="flex items-center gap-2">
                {(userData as any)?.profile_image ? (
                  <img
                    src={(userData as any).profile_image}
                    alt="Logo da empresa"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#A502CA] rounded-full flex items-center justify-center">
                    <MdPerson className="text-white text-sm" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                  {userData?.organization_name || userData?.full_name || 'Prestador'}
                </span>
              </div>

              <button
                onClick={handleLogoutClick}
                className="px-3 py-2 text-gray-600 hover:text-red-600 transition-all duration-200 flex items-center gap-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 relative"
                disabled={isLoggingOut}
                title="Sair do dashboard"
              >
                <MdLogout className="text-lg" />
                <span className="font-medium hidden lg:inline">Sair</span>
                {isLoggingOut && (
                  <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white z-50"
          >
            <div className="px-4 py-3 space-y-2">
              <Link 
                href="/"
                className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <MdHome className="text-lg" />
                  <span>Ir para site</span>
                </div>
              </Link>
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left text-gray-600 hover:text-red-600 transition-colors py-2 px-3 rounded-lg hover:bg-red-50"
                disabled={isLoggingOut}
              >
                <div className="flex items-center gap-2">
                  <MdLogout className="text-lg" />
                  <span className="font-medium">Sair</span>
                  {isLoggingOut && (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin ml-auto"></div>
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="bg-gray-50 min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4"
            onClick={handleModalBackdropClick}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <MdWarning className="text-2xl text-red-600" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Sair do Dashboard?
                </h3>
                
                <p className="text-gray-600 text-sm">
                  Você será desconectado e redirecionado para o login.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleLogoutCancel}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saindo...
                    </>
                  ) : (
                    <>
                      <MdLogout className="text-lg" />
                      Sair
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
