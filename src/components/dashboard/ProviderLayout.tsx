'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MdMenu, MdClose, MdLogout, MdHome, MdPerson } from 'react-icons/md';
import { Logo } from '@/components/ui/Logo';

interface ProviderLayoutProps {
  children: React.ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { performLogout } = await import('@/lib/logout');
      await performLogout('provider_layout');
    } catch (error) {
      console.error('Erro durante logout do provider layout:', error);
      // Fallback
      window.location.href = '/auth/login?reason=general_error';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/prestador">
                <Logo width={40} height={40} />
              </Link>
              <span className="ml-3 text-lg font-semibold text-[#520029]">
                Dashboard do Prestador
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/"
                className="text-gray-600 hover:text-[#A502CA] transition-colors flex items-center gap-2"
              >
                <MdHome />
                Ir para site
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#A502CA] rounded-full flex items-center justify-center">
                  <MdPerson className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Barreto's Buffet
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-2"
              >
                <MdLogout />
                Sair
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
            <div className="px-4 py-3 space-y-3">
              <Link 
                href="/"
                className="block text-gray-600 hover:text-[#A502CA] transition-colors"
              >
                Ir para site
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-gray-600 hover:text-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="bg-gray-50 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
