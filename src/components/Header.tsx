'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { Logo } from '@/components/ui';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from './LogoutButton';
import { 
  MdAccountCircle,
  MdDashboard,
  MdExitToApp,
  MdExpandMore,
  MdPerson,
  MdSettings,
  MdKeyboardArrowDown,
  MdLogout,
  MdMenu,
  MdClose,
  MdInfo
} from 'react-icons/md';

// Componente UserDropdown
interface UserDropdownProps {
  user: any;
  userType: 'client' | 'service_provider' | null;
}

// Componente ProviderNotice integrado
function ProviderNotice({ userName, onClose }: { userName?: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 relative z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MdInfo className="text-white text-lg flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium">Olá, {userName}!</span>
            <span className="ml-2">
              Você está navegando como prestador. Esta é a visão do cliente da plataforma.
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/prestador"
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-all"
          >
            <MdDashboard className="text-sm" />
            Meu Dashboard
          </Link>
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-all"
          >
            <MdClose className="text-white text-lg" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function UserDropdown({ user, userType }: UserDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Fechar dropdown primeiro
      setIsDropdownOpen(false);
      
      console.log('🔴 Iniciando logout do Header...');
      
      // Timeout de segurança
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Timeout de logout no header, forçando redirecionamento...');
        window.location.href = '/auth/login?reason=header_timeout';
      }, 8000);
      
      // Usar função utilitária de logout
      const { performLogout } = await import('@/lib/logout');
      await performLogout('header_dropdown');
      
      // Se chegou até aqui, forçar redirecionamento
      clearTimeout(timeoutId);
      setTimeout(() => {
        window.location.href = '/auth/login?reason=header_manual';
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro durante logout do header:', error);
      // Mesmo com erro, forçar redirecionamento
      setTimeout(() => {
        window.location.href = '/auth/login?reason=header_error';
      }, 500);
    }
  };

  const userInitial = user?.user_metadata?.full_name ? 
    user.user_metadata.full_name.charAt(0).toUpperCase() : 
    user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative user-dropdown">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-[#FF0080] rounded-full flex items-center justify-center text-white text-sm font-medium">
          {userInitial}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
        </span>
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* User Info Header */}
            <div className="bg-gradient-to-r from-[#FF0080] to-[#A502CA] p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {userInitial}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {user?.user_metadata?.full_name || 'Usuário'}
                  </h3>
                  <p className="text-white/80 text-sm">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {userType === 'service_provider' ? 'Prestador' : 'Cliente'}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-3">
              <Link
                href="/perfil"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center space-x-4 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#FF0080]/5 hover:to-[#A502CA]/5 hover:text-[#FF0080] transition-all duration-200 group mx-2 rounded-xl"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#FF0080]/10 transition-colors">
                  <MdPerson className="text-lg group-hover:text-[#FF0080]" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Minha Área</div>
                  <div className="text-xs text-gray-500">Gerencie seu perfil</div>
                </div>
              </Link>

              {userType === 'service_provider' && (
                <Link
                  href="/dashboard/prestador"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-4 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#FF0080]/5 hover:to-[#A502CA]/5 hover:text-[#FF0080] transition-all duration-200 group mx-2 rounded-xl"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#FF0080]/10 transition-colors">
                    <MdDashboard className="text-lg group-hover:text-[#FF0080]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Dashboard</div>
                    <div className="text-xs text-gray-500">Área do prestador</div>
                  </div>
                </Link>
              )}
            </div>

            <div className="border-t border-gray-100 p-3">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-4 px-5 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group mx-2 rounded-xl w-full"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
                  <MdLogout className="text-lg group-hover:text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Sair</div>
                  <div className="text-xs text-gray-500">Encerrar sessão</div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/prestadores')) {
    return <ProviderHeader />;
  }
  
  if (pathname?.startsWith('/dashboard/prestador')) {
    return null; // Não renderizar header, pois o ProviderLayout já tem seu próprio
  }
  
  if (pathname?.startsWith('/admin')) {
    return null; // Admin tem seu próprio layout
  }
  
  return <HomeHeader />;
}

function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProviderNotice, setShowProviderNotice] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'client' | 'service_provider' | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Buscar o tipo do usuário da tabela users
        const { data: userData } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setUserType(userData.role === 'provider' ? 'service_provider' : 'client');
        }
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Buscar dados atualizados do usuário
        const { data: userData } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUserType(userData.role === 'provider' ? 'service_provider' : 'client');
        }
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <>
      {/* Provider Notice - Fixo no topo */}
      <AnimatePresence>
        {userType === 'service_provider' && showProviderNotice && (
          <ProviderNotice 
            userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]} 
            onClose={() => setShowProviderNotice(false)}
          />
        )}
      </AnimatePresence>
      
      <header 
        className={`w-full bg-white shadow-sm py-4 px-6 fixed ${userType === 'service_provider' && showProviderNotice ? 'top-12' : 'top-0'} z-40 transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/servicos"
              className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
            >
              Categorias
            </Link>
            <ScrollLink 
              to="como-funciona" 
              smooth={true} 
              duration={500} 
              className="text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer font-poppins"
            >
              Como Funciona
            </ScrollLink>
            <ScrollLink 
              to="prestadores" 
              smooth={true} 
              duration={500} 
              className="text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer font-poppins"
            >
              Prestadores
            </ScrollLink>
            {user ? (
              <>
                {userType === 'service_provider' && (
                  <Link 
                    href="/dashboard/prestador" 
                    className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
                  >
                    Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link 
                  href="/minhas-festas"
                  onClick={() => setIsMenuOpen(false)}
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
              </>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <UserDropdown user={user} userType={userType} />
            ) : (
              <>
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
              </>
            )}
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
              href="/servicos"
              className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Categorias
            </Link>
            <ScrollLink 
              to="como-funciona" 
              smooth={true} 
              duration={500} 
              className="block text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Como Funciona
            </ScrollLink>
            <ScrollLink 
              to="prestadores" 
              smooth={true} 
              duration={500} 
              className="block text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Prestadores
            </ScrollLink>
            {user ? (
              <>
                {userType === 'service_provider' && (
                  <Link 
                    href="/dashboard/prestador" 
                    className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link 
                  href="/perfil" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#FF0080] transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-6 h-6 bg-[#FF0080] rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span>Minha Área</span>
                </Link>
                <div className="pt-4 border-t border-gray-200">
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/minhas-festas"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
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
              </>
            )}
          </nav>
        </motion.div>
      </header>
    </>
  );
}

// Header para a página de prestadores
function ProviderHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'client' | 'service_provider' | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Buscar o tipo do usuário da tabela users
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setUserType(userData.role === 'provider' ? 'service_provider' : 'client');
        }
      }
    };

    getUser();
  }, []);

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
          {user && userType === 'service_provider' ? (
            <>
              <Link 
                href="/dashboard/prestador"
                className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
              >
                Dashboard
              </Link>
              <Link 
                href="/"
                className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
              >
                Para Clientes
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user && userType === 'service_provider' ? (
            <LogoutButton />
          ) : (
            <>
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
                Cadastrar
              </Link>
            </>
          )}
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
          {user && userType === 'service_provider' ? (
            <>
              <Link 
                href="/dashboard/prestador"
                className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/"
                className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Para Clientes
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
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
                  Cadastrar
                </Link>
              </div>
            </>
          )}
        </nav>
      </motion.div>
    </header>
  );
}
