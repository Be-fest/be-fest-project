'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { Logo } from '@/components/ui';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useOffCanvas } from '@/contexts/OffCanvasContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isCartOpen } = useOffCanvas();
  
  // Determinar se estamos na rota de prestadores
  const isProviderRoute = pathname?.startsWith('/prestadores') || pathname?.startsWith('/dashboard/prestador');
  
  // Cor principal baseada na rota
  const primaryColor = isProviderRoute ? '#A502CA' : '#FF0080';
  const primaryColorHover = isProviderRoute ? '#8B0A9E' : '#E6006F';

  return (
    <>
      {/* Overlay quando carrinho estiver aberto */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}
      
      <header 
        className={`w-full bg-white shadow-sm py-4 px-6 fixed top-0 z-50 transition-all duration-300 ${
          isCartOpen ? 'opacity-90' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            {isProviderRoute ? (
              <img 
                src="/be-fest-provider-logo.png" 
                alt="Be Fest Provider Logo" 
                className="h-10 w-auto"
              />
            ) : (
              <Logo />
            )}
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <ScrollLink 
              to="categorias" 
              smooth={true} 
              duration={500} 
              className="text-gray-600 transition-colors cursor-pointer font-poppins"
              style={{ 
                ':hover': { color: primaryColor }
              }}
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              Categorias
            </ScrollLink>
            <Link 
              href="/faca-festa" 
              className="text-gray-600 transition-colors font-poppins hover-link"
              style={{
                color: pathname === '/faca-festa' ? primaryColor : '#6B7280'
              }}
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = pathname === '/faca-festa' ? primaryColor : '#6B7280'}
            >
              New Fest
            </Link>
            <ScrollLink 
              to="contatos" 
              smooth={true} 
              duration={500} 
              className="text-gray-600 transition-colors cursor-pointer font-poppins"
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              Contatos
            </ScrollLink>
            <Link 
              href="/prestadores" 
              className="text-gray-600 transition-colors font-poppins"
              style={{
                color: isProviderRoute ? primaryColor : '#6B7280'
              }}
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = isProviderRoute ? primaryColor : '#6B7280'}
            >
              Seja um Prestador
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/auth/login"
              className="text-gray-600 transition-colors font-poppins"
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              Entrar
            </Link>
            <Link 
              href="/auth/register"
              className="text-white px-4 py-2 rounded-lg transition-colors font-poppins"
              style={{ 
                backgroundColor: primaryColor,
                ':hover': { backgroundColor: primaryColorHover }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = primaryColorHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
            >
              Cadastrar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col items-center justify-center w-6 h-6 space-y-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div 
          className={`md:hidden bg-white border-t border-gray-200 ${isMenuOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <nav className="px-6 py-4 space-y-4">
            <ScrollLink 
              to="categorias" 
              smooth={true} 
              duration={500} 
              className="block text-gray-600 transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              Categorias
            </ScrollLink>
            <Link 
              href="/faca-festa" 
              className="block text-gray-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
              style={{
                color: pathname === '/faca-festa' ? primaryColor : '#6B7280'
              }}
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = pathname === '/faca-festa' ? primaryColor : '#6B7280'}
            >
              New Fest
            </Link>
            <ScrollLink 
              to="contatos" 
              smooth={true} 
              duration={500} 
              className="block text-gray-600 transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              Contatos
            </ScrollLink>
            <Link 
              href="/prestadores" 
              className="block text-gray-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
              style={{
                color: isProviderRoute ? primaryColor : '#6B7280'
              }}
              onMouseEnter={(e) => e.target.style.color = primaryColor}
              onMouseLeave={(e) => e.target.style.color = isProviderRoute ? primaryColor : '#6B7280'}
            >
              Seja um Prestador
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Link 
                href="/auth/login"
                className="block text-gray-600 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
                onMouseEnter={(e) => e.target.style.color = primaryColor}
                onMouseLeave={(e) => e.target.style.color = '#6B7280'}
              >
                Entrar
              </Link>
              <Link 
                href="/auth/register"
                className="block text-white px-4 py-2 rounded-lg transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  backgroundColor: primaryColor
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = primaryColorHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                Cadastrar
              </Link>
            </div>
          </nav>
        </motion.div>
      </header>
    </>
  );
}
