'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

export function Footer() {
  return (
    <motion.footer 
      className="bg-white text-gray-900 py-16 px-6 border-t border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-[#FF0080] font-poppins">Be Fest</h3>
            <p className="text-gray-600 leading-relaxed font-poppins">
              Conectando você à felicidade através da organização perfeita de eventos. 
              Encontre os melhores prestadores de serviços para sua festa.
            </p>            <div className="flex space-x-4">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 bg-[#FF0080] rounded-full flex items-center justify-center cursor-pointer"
              >
                <a href="https://www.instagram.com/be_.fest/" target="_blank" rel="noopener noreferrer">
                  <FaInstagram className="text-white text-sm" />
                </a>
              </motion.div>
            </div>
          </div>          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-[#520029] font-poppins">Navegação</h4>
            <ul className="space-y-3 text-gray-600 font-poppins">
              <li>
                <ScrollLink 
                  to="categorias" 
                  smooth={true} 
                  duration={500} 
                  className="hover:text-[#FF0080] transition-colors cursor-pointer"
                >
                  Categorias
                </ScrollLink>
              </li>
              <li><Link href="/faca-festa" className="hover:text-[#FF0080] transition-colors">Criar minha festa</Link></li>
              <li><Link href="/sobre" className="hover:text-[#FF0080] transition-colors">Sobre nós</Link></li>
              <li><Link href="/ajuda" className="hover:text-[#FF0080] transition-colors">Ajuda</Link></li>
            </ul>
          </div>          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-[#520029] font-poppins">Categorias</h4>
            <ul className="space-y-3 text-gray-600 font-poppins">
              <li><Link href="/categoria/comida-bebida" className="hover:text-[#FF0080] transition-colors">Comida e Bebida</Link></li>
              <li><Link href="/categoria/entretenimento" className="hover:text-[#FF0080] transition-colors">Entretenimento</Link></li>
              <li><Link href="/categoria/decoracao" className="hover:text-[#FF0080] transition-colors">Decoração</Link></li>
              <li><Link href="/categoria/musica" className="hover:text-[#FF0080] transition-colors">Música</Link></li>
            </ul>
          </div>          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-[#520029] font-poppins">Entre em Contato</h4>
            <div className="space-y-4 text-gray-600 font-poppins">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-[#FF0080] rounded-full flex items-center justify-center">
                  <MdEmail className="text-white text-xs" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">E-mail</div>
                  <span>befest21@gmail.com</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-[#FF0080] rounded-full flex items-center justify-center">
                  <MdPhone className="text-white text-xs" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">WhatsApp</div>
                  <span>21 980082781</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-[#FF0080] rounded-full flex items-center justify-center">
                  <MdPhone className="text-white text-xs" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Telefone</div>
                  <span>21 980082781</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-[#FF0080] rounded-full flex items-center justify-center">
                  <MdLocationOn className="text-white text-xs" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500">Local</div>
                  <span>Rio de Janeiro - RJ</span>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Link 
                href="/auth/register"
                className="inline-block bg-[#FF0080] text-white px-6 py-3 rounded-lg hover:bg-[#E6006F] transition-colors font-semibold font-poppins"
              >
                Seja um Parceiro
              </Link>
            </div>
          </div>
        </div>        <div className="border-t border-gray-300 pt-8 text-center text-gray-600">
          <p className="font-poppins">&copy; 2025 Be Fest. Todos os direitos reservados. Sua festa num clique!</p>
        </div>
      </div>
    </motion.footer>
  );
}
