'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { Logo } from '@/components/ui';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
  MdAdminPanelSettings
} from 'react-icons/md';

// Componente UserDropdown
interface UserDropdownProps {
  user: any;
  userType: 'client' | 'provider' | 'admin' | null;
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
      
      // Usar função utilitária de logout melhorada
      const { performLogout } = await import('@/lib/logout');
      await performLogout('header_dropdown');
      
      // Se chegou até aqui sem redirecionar, forçar redirecionamento manual
      console.warn('⚠️ Logout concluído mas ainda na página, forçando redirecionamento...');
      window.location.href = '/auth/login?reason=header_manual';
      
    } catch (error) {
      console.error('❌ Erro durante logout do header:', error);
      // Mesmo com erro, forçar redirecionamento
      window.location.href = '/auth/login?reason=header_error';
    }
  };

  const userInitial = user?.user_metadata?.full_name ? 
    user.user_metadata.full_name.charAt(0).toUpperCase() : 
    user?.email?.charAt(0).toUpperCase() || 'U';

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'admin':
        return 'Administrador';
      case 'provider':
        return 'Prestador';
      case 'client':
        return 'Cliente';
      default:
        return 'Usuário';
    }
  };

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
                    {getUserTypeLabel()}
                  </span>
                </div>
              </div>
            </div>

            <div className="py-3">
              {/* Link para Admin se for admin */}
              {userType === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-4 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#FF0080]/5 hover:to-[#A502CA]/5 hover:text-[#FF0080] transition-all duration-200 group mx-2 rounded-xl"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#FF0080]/10 transition-colors">
                    <MdAdminPanelSettings className="text-lg group-hover:text-[#FF0080]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Painel Admin</div>
                    <div className="text-xs text-gray-500">Área administrativa</div>
                  </div>
                </Link>
              )}

              {/* Link para Dashboard se for prestador */}
              {userType === 'provider' && (
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

              {/* Link para Perfil se for cliente */}
              {userType === 'client' && (
                <Link
                  href="/perfil"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-4 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#FF0080]/5 hover:to-[#A502CA]/5 hover:text-[#FF0080] transition-all duration-200 group mx-2 rounded-xl"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#FF0080]/10 transition-colors">
                    <MdPerson className="text-lg group-hover:text-[#FF0080]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Meu Perfil</div>
                    <div className="text-xs text-gray-500">Área do cliente</div>
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
  const { user, userData, loading } = useAuth();
  
  // Extrair o tipo de usuário dos dados do useAuth
  const userType = userData?.role as 'client' | 'provider' | 'admin' | null;

  console.log('🔄 Header: Estado do useAuth', { 
    hasUser: !!user, 
    hasUserData: !!userData, 
    userType, 
    loading 
  });

  // Se estiver na rota de admin, não renderizar header (admin tem seu próprio layout)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Se estiver na rota de dashboard do prestador, não renderizar header (prestador tem seu próprio layout)
  if (pathname?.startsWith('/dashboard/prestador')) {
    return null;
  }

  // Se estiver na rota seja-um-prestador, sempre mostrar header de prestador
  if (pathname?.startsWith('/seja-um-prestador')) {
    return <ProviderHeader user={user} userType={userType} loading={loading} />;
  }

  // Se estiver na rota de prestadores, mostrar header de prestador
  if (pathname?.startsWith('/prestadores')) {
    return <ProviderHeader user={user} userType={userType} loading={loading} />;
  }

  // Se ainda está carregando, mostrar skeleton
  if (loading) {
    return <HeaderSkeleton />;
  }

  // Para outras rotas, mostrar header baseado no role do usuário
  if (user && !loading) {
    if (userType === 'admin') {
      return <AdminHeader user={user} userType={userType} />;
    } else if (userType === 'provider') {
      return <ProviderHeader user={user} userType={userType} loading={loading} />;
    } else {
      return <HomeHeader user={user} userType={userType} loading={loading} />;
    }
  }

  // Se não estiver logado, mostrar header padrão
  return <HomeHeader user={user} userType={userType} loading={loading} />;
}

// Componente Skeleton para o header durante carregamento
function HeaderSkeleton() {
  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 fixed top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Skeleton */}
        <div className="flex items-center">
          <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        {/* Navigation Skeleton */}
        <nav className="hidden md:flex items-center space-x-8">
          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
        </nav>

        {/* Auth Buttons Skeleton */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
        </div>

        {/* Mobile Menu Button Skeleton */}
        <div className="md:hidden flex flex-col items-center justify-center w-6 h-6 space-y-1">
          <div className="w-6 h-0.5 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-6 h-0.5 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-6 h-0.5 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    </header>
  );
}

// Header para administradores
function AdminHeader({ user, userType }: { user: any; userType: 'client' | 'provider' | 'admin' | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 fixed top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/admin"
            className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins flex items-center gap-2"
          >
            <MdAdminPanelSettings className="text-lg" />
            Painel Admin
          </Link>
          <Link 
            href="/servicos"
            className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
          >
            Serviços
          </Link>
          <Link 
            href="/prestadores"
            className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
          >
            Prestadores
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <UserDropdown user={user} userType={userType} />
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
            href="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-[#FF0080] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <MdAdminPanelSettings className="text-lg" />
            Painel Admin
          </Link>
          <Link 
            href="/servicos"
            className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Serviços
          </Link>
          <Link 
            href="/prestadores"
            className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Prestadores
          </Link>
          <div className="pt-4 border-t border-gray-200">
            <UserDropdown user={user} userType={userType} />
          </div>
        </nav>
      </motion.div>
    </header>
  );
}

function HomeHeader({ user, userType, loading }: { user: any; userType: 'client' | 'provider' | 'admin' | null; loading: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header 
        className="w-full bg-white shadow-sm py-4 px-6 fixed top-0 z-40 transition-all duration-300"
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
              Serviços
            </Link>
            <ScrollLink 
              to="como-funciona" 
              smooth={true} 
              duration={500} 
              className="text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer font-poppins"
            >
              Como Funciona
            </ScrollLink>
            <Link
              href="/prestadores"
              className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
            >
              Prestadores
            </Link>
            {user ? (
              <>
                {userType === 'provider' && (
                  <Link 
                    href="/dashboard/prestador" 
                    className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
                  >
                    Dashboard
                  </Link>
                )}
                {userType === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins flex items-center gap-2"
                  >
                    <MdAdminPanelSettings className="text-lg" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <> 
                <Link 
                  href="/seja-um-prestador" 
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
              // Skeleton apenas no carregamento inicial e por pouco tempo
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
              </div>
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
              Serviços
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
            <Link
              href="/prestadores"
              className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Prestadores
            </Link>
            {user ? (
              <>
                {userType === 'provider' && (
                  <Link 
                    href="/dashboard/prestador" 
                    className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {userType === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 text-gray-600 hover:text-[#FF0080] transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MdAdminPanelSettings className="text-lg" />
                    Admin
                  </Link>
                )}
                <Link 
                  href="/perfil" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#FF0080] transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-6 h-6 bg-[#FF0080] rounded-full flex items-center justify-center text-white text-xs font-medium">
                    U
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
                  href="/perfil?tab=minhas-festas"
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
                  href="/seja-um-prestador" 
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
function ProviderHeader({ user, userType, loading }: { user: any; userType: 'client' | 'provider' | 'admin' | null; loading: boolean }) {
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
          {user && userType === 'provider' ? (
            <>
              <Link 
                href="/dashboard/prestador"
                className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
              >
                Dashboard
              </Link>
              <Link 
                href="/servicos"
                className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
              >
                Serviços
              </Link>
              <Link 
                href="/prestadores"
                className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
              >
                Prestadores
              </Link>
              <Link 
                href="/seja-um-prestador"
                className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins"
              >
                Seja um Prestador
              </Link>
            </>
          ) : user && userType === 'admin' ? (
            <>
              <Link 
                href="/admin"
                className="text-gray-600 hover:text-[#A502CA] transition-colors font-poppins flex items-center gap-2"
              >
                <MdAdminPanelSettings className="text-lg" />
                Admin
              </Link>
            </>
          ) : (
            <>
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
                to="faq"
                smooth={true} 
                duration={500}
                className="text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer font-poppins"
              >
                FAQ
              </ScrollLink>
              <ScrollLink 
                to="contato"
                smooth={true} 
                duration={500}
                className="text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer font-poppins"
              >
                Contato
              </ScrollLink>
            </>
          )}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ) : user ? (
            <UserDropdown user={user} userType={userType} />
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
          {user && userType === 'provider' ? (
            <>
              <Link 
                href="/dashboard/prestador"
                className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/servicos"
                className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Serviços
              </Link>
              <Link 
                href="/prestadores"
                className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Prestadores
              </Link>
              <Link 
                href="/seja-um-prestador"
                className="block text-gray-600 hover:text-[#A502CA] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Seja um Prestador
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <UserDropdown user={user} userType={userType} />
              </div>
            </>
          ) : user && userType === 'admin' ? (
            <>
              <Link 
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-[#A502CA] transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <MdAdminPanelSettings className="text-lg" />
                Admin
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <UserDropdown user={user} userType={userType} />
              </div>
            </>
          ) : (
            <>
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
                to="faq"
                smooth={true} 
                duration={500}
                className="block text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </ScrollLink>
              <ScrollLink 
                to="contato"
                smooth={true} 
                duration={500}
                className="block text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
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
