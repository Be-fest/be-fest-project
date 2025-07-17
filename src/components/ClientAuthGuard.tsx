'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface ClientAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'provider' | 'admin';
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ClientAuthGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/auth/login',
  fallback 
}: ClientAuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  
  // Criar cliente uma única vez
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  
  // Flag para evitar setState após unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    console.log('🔄 ClientAuthGuard useEffect executado');
    
    const checkAuth = async () => {
      console.log('🔍 Iniciando checkAuth...');
      
      try {
        console.log('📡 Buscando sessão...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📋 Resultado da sessão:', { session: !!session, error });
        
        if (!mountedRef.current) {
          console.log('❌ Componente não montado, abortando');
          return;
        }
        
        if (error || !session?.user) {
          console.log('🚫 Erro ou sem sessão, redirecionando...');
          if (mountedRef.current) {
            router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`);
          }
          return;
        }

        console.log('✅ Usuário autenticado:', session.user.id);
        setUser(session.user);

        // Se não há role obrigatório, autorizar diretamente
        if (!requiredRole) {
          console.log('✅ Sem role obrigatório, autorizando diretamente');
          setIsAuthorized(true);
          return;
        }

        // Buscar dados do usuário apenas se necessário para verificação de role
        console.log('👤 Buscando dados do usuário para verificar role...');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        console.log('📊 Resultado dos dados do usuário:', { userData, userError });

        if (!mountedRef.current) {
          console.log('❌ Componente não montado após busca, abortando');
          return;
        }

        const userActualRole = userData?.role || 'client';
        console.log('🎭 Role do usuário:', userActualRole);
        setUserRole(userActualRole);

        // Verificar se o usuário tem o papel necessário
        if (userActualRole !== requiredRole) {
          console.log('🚫 Role não autorizado:', { required: requiredRole, actual: userActualRole });
          if (mountedRef.current) {
            router.push('/acesso-negado');
          }
          return;
        }

        console.log('✅ Usuário autorizado!');
        setIsAuthorized(true);

      } catch (error) {
        if (mountedRef.current) {
          console.error('💥 Erro na verificação de autenticação:', error);
          router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}&reason=auth_error`);
        }
      } finally {
        if (mountedRef.current) {
          console.log('🏁 Finalizando loading...');
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Escutar mudanças na autenticação
    console.log('👂 Configurando listener de auth state...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, !!session);
        
        if (!mountedRef.current) {
          console.log('❌ Componente não montado no auth change');
          return;
        }
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('🚪 Usuário deslogado');
          setUser(null);
          setUserRole(null);
          setIsAuthorized(false);
          router.push(`${redirectTo}?reason=signed_out`);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('🚪 Usuário logado, recarregando verificação...');
          // Recarregar a verificação
          checkAuth();
        }
      }
    );

    return () => {
      console.log('🧹 Limpando ClientAuthGuard...');
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // ✅ Dependências vazias para evitar re-renders

  // Cleanup no unmount
  useEffect(() => {
    console.log('🎬 ClientAuthGuard montado');
    return () => {
      console.log('🎬 ClientAuthGuard desmontado');
      mountedRef.current = false;
    };
  }, []);

  console.log('🎨 Renderizando ClientAuthGuard:', { loading, user: !!user, userRole, isAuthorized });

  // Loading state
  if (loading) {
    console.log('⏳ Mostrando loading...');
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        {/* <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div> */}
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    console.log('🚫 Não autorizado, não renderizando...');
    return null; // O redirecionamento já foi feito
  }

  // Authorized
  console.log('✅ Renderizando children');
  return <>{children}</>;
}