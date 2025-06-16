'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/ui';

export function Header() {
  return (
    <motion.header 
      className="w-full bg-white shadow-sm py-4 px-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/categorias" className="text-gray-600 hover:text-[#FF0080] transition-colors">
            Categorias
          </Link>
          <Link href="/faca-festa" className="text-gray-600 hover:text-[#FF0080] transition-colors">
            New Fest
          </Link>
          <Link href="/contatos" className="text-gray-600 hover:text-[#FF0080] transition-colors">
            Contatos
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
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
      </div>
    </motion.header>
  );
}
