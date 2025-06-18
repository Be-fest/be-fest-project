'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { Logo } from '@/components/ui';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 fixed top-0 z-50">
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
            className="text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer"
          >
            Categorias
          </ScrollLink>
          <Link href="/faca-festa" className="text-gray-600 hover:text-[#FF0080] transition-colors">
            New Fest
          </Link>
          <ScrollLink 
            to="contatos" 
            smooth={true} 
            duration={500} 
            className="text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer"
          >
            Contatos
          </ScrollLink>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link 
            href="/auth/login"
            className="text-gray-600 hover:text-[#FF0080] transition-colors"
          >
            Entrar
          </Link>
          <Link 
            href="/auth/register"
            className="bg-[#FF0080] text-white px-4 py-2 rounded-lg hover:bg-[#E6006F] transition-colors"
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
              className="block bg-[#FF0080] text-white px-4 py-2 rounded-lg hover:bg-[#E6006F] transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Cadastrar
            </Link>
          </div>
        </nav>
      </motion.div>    </header>
  );
}
