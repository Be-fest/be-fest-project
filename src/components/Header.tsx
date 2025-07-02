'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Link as ScrollLink } from 'react-scroll';
import { Logo } from '@/components/ui';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useOffCanvas } from '@/contexts/OffCanvasContext';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import LogoutButton from './LogoutButton';
import { useEffect, useRef } from 'react';
import { 
  MdAccountCircle,
  MdDashboard,
  MdExitToApp,
  MdExpandMore,
  MdPerson,
  MdSettings,
  MdKeyboardArrowDown
} from 'react-icons/md';

// Componente UserDropdown
interface UserDropdownProps {
  user: any;
  userType: 'client' | 'service_provider' | null;
}

function UserDropdown({ user, userType }: UserDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseClient();

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 group ${
          isDropdownOpen 
            ? 'bg-gray-50 ring-2 ring-[#FF0080]/20' 
            : 'hover:bg-gray-50 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-[#FF0080] to-[#A502CA] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-white">
            {userInitial}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-sm font-semibold text-gray-800">Minha Conta</div>
            <div className="text-xs text-gray-500 truncate max-w-32">{userName}</div>
          </div>
        </div>
        <MdKeyboardArrowDown 
          className={`text-gray-400 transition-all duration-200 ${
            isDropdownOpen ? 'rotate-180 text-[#FF0080]' : 'group-hover:text-gray-600'
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 backdrop-blur-sm"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)'
            }}
          >
            {/* User Info Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#FF0080] to-[#A502CA] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {userInitial}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{userName}</div>
                  <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#FF0080]/10 text-[#FF0080] mt-1">
                    {userType === 'service_provider' ? '👔 Prestador' : '🎉 Cliente'}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
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

              <Link
                href="/perfil?tab=settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center space-x-4 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#FF0080]/5 hover:to-[#A502CA]/5 hover:text-[#FF0080] transition-all duration-200 group mx-2 rounded-xl"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-[#FF0080]/10 transition-colors">
                  <MdSettings className="text-lg group-hover:text-[#FF0080]" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Configurações</div>
                  <div className="text-xs text-gray-500">Ajustar preferências</div>
                </div>
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 pt-3 mt-1">
              <button
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center space-x-4 px-5 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left group mx-2 rounded-xl"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                  <MdExitToApp className="text-lg" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Sair</div>
                  <div className="text-xs text-red-400">Fazer logout da conta</div>
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
    return <DashboardHeader />;
  }
  
  return <HomeHeader />;
}

function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isCartOpen, openOffCanvas } = useOffCanvas();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'client' | 'service_provider' | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

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
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}
      
      <header 
        className={`w-full bg-white shadow-sm py-4 px-6 fixed top-0 z-40 transition-all duration-300 ${
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
                <button 
                  onClick={() => {
                    openOffCanvas();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-[#FF0080] transition-colors font-poppins"
                >
                  New Fest
                </button>
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
            <ScrollLink 
              to="categorias" 
              smooth={true} 
              duration={500} 
              className="block text-gray-600 hover:text-[#FF0080] transition-colors cursor-pointer py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Categorias
            </ScrollLink>
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
                <button 
                  onClick={() => {
                    openOffCanvas();
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-[#FF0080] transition-colors py-2"
                >
                  New Fest
                </button>
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
  const supabase = createSupabaseClient();

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
              <ScrollLink 
                to="precos"
                smooth={true} 
                duration={500}
                className="text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer font-poppins"
              >
                Preços
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
              <ScrollLink 
                to="precos"
                smooth={true} 
                duration={500}
                className="block text-gray-600 hover:text-[#A502CA] transition-colors cursor-pointer py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Preços
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
        <div className="hidden md:flex items-center space-x-5">
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
