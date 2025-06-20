'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { Logo } from '@/components/ui';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useOffCanvas } from '@/contexts/OffCanvasContext';

export function Header() {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/prestadores')) {
    return <ProviderHeader />;
  }
  
  if (pathname?.startsWith('/dashboard/prestador')) {
    return <DashboardHeader />;
  }
  
  return <HomeHeader />;
}

function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isCartOpen } = useOffCanvas();
  return (
    <>
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
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <ScrollLink 
              to="categorias" 
              smooth={true} 
              duration={500} 
              className="text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer font-poppins"
            >
              Categorias
            </ScrollLink>
            <Link 
              href="/faca-festa" 
              className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
            >
              New Fest
            </Link>
            <ScrollLink 
              to="contatos" 
              smooth={true} 
              duration={500} 
              className="text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer font-poppins"
            >
              Contatos
            </ScrollLink>
            <Link 
              href="/prestadores" 
              className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
            >
              Seja um Prestador
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/auth/login"
              className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
            >
              Entrar
            </Link>
            <Link 
              href="/auth/register"
              className="bg-[#FF0080] hover:bg-[#E6006F] text-white px-4 py-2 rounded-lg transition-colors font-poppins"
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
              className="block text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Categorias
            </ScrollLink>
            <Link 
              href="/faca-festa" 
              className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              New Fest
            </Link>
            <ScrollLink 
              to="contatos" 
              smooth={true} 
              duration={500} 
              className="block text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contatos
            </ScrollLink>
            <Link 
              href="/prestadores" 
              className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Seja um Prestador
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Link 
                href="/auth/login"
                className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </Link>
              <Link 
                href="/auth/register"
                className="block bg-[#FF0080] hover:bg-[#E6006F] text-white px-4 py-2 rounded-lg transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
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

// Header para a página de prestadores
function ProviderHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img 
            src="/be-fest-provider-logo.png" 
            alt="Be Fest Provider Logo" 
            className="h-10 w-auto"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/"
            className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
          >
            Para Clientes
          </Link>
          <ScrollLink 
            to="beneficios"
            smooth={true} 
            duration={500}
            className="text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer font-poppins"
          >
            Benefícios
          </ScrollLink>
          <ScrollLink 
            to="como-funciona"
            smooth={true} 
            duration={500}
            className="text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer font-poppins"
          >
            Como Funciona
          </ScrollLink>
          <ScrollLink 
            to="precos"
            smooth={true} 
            duration={500}
            className="text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer font-poppins"
          >
            Preços
          </ScrollLink>
          <Link 
            href="/dashboard/prestador"
            className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
          >
            Dashboard
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link 
            href="/auth/login"
            className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
          >
            Entrar
          </Link>
          <Link 
            href="/auth/register"
            className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-2 rounded-lg transition-colors font-poppins"
          >
            Cadastrar-se
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
          <Link 
            href="/"
            className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Para Clientes
          </Link>
          <ScrollLink 
            to="beneficios"
            smooth={true} 
            duration={500}
            className="block text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Benefícios
          </ScrollLink>
          <ScrollLink 
            to="como-funciona"
            smooth={true} 
            duration={500}
            className="block text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Como Funciona
          </ScrollLink>
          <ScrollLink 
            to="precos"
            smooth={true} 
            duration={500}
            className="block text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Preços
          </ScrollLink>
          <Link 
            href="/dashboard/prestador"
            className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <Link 
              href="/auth/login"
              className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Entrar
            </Link>
            <Link 
              href="/auth/register"
              className="block bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-2 rounded-lg transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Cadastrar-se
            </Link>
          </div>
        </nav>
      </motion.div>
    </header>
  );
}

// Header para o dashboard do prestador
function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/dashboard/prestador" className="flex items-center">
          <img 
            src="/be-fest-provider-logo.png" 
            alt="Be Fest Provider Logo" 
            className="h-10 w-auto"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/"
            className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
          >
            Site Principal
          </Link>
          <Link 
            href="/prestadores"
            className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
          >
            Página Prestadores
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#A502CA] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Barreto's Buffet
            </span>
          </div>
          <Link 
            href="/auth/login"
            className="text-gray-600 hover:text-red-600 transition-colors font-poppins"
          >
            Sair
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
          <Link 
            href="/"
            className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Site Principal
          </Link>
          <Link 
            href="/prestadores"
            className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Página Prestadores
          </Link>
          <div className="pt-4 border-t border-gray-200">
            <Link 
              href="/auth/login"
              className="block text-gray-600 hover:text-red-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Sair
            </Link>
          </div>
        </nav>
      </motion.div>
    </header>
  );
}
