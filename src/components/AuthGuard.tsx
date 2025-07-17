'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'provider' | 'admin';
  redirectTo?: string;
}

export function AuthGuard({ children, requiredRole, redirectTo = '/auth/login' }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Criar cliente uma única vez
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  
  // Flag para evitar setState após unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    console.log('🔄 AuthGuard useEffect executado');
    
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
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error);
          console.log('🔄 Redirecionando para login...');
          router.push(redirectTo);
          return;
        }

        if (!session) {
          console.log('🚫 Sem sessão, redirecionando para login...');
          router.push(redirectTo);
          return;
        }

        console.log('✅ Usuário autenticado:', session.user.id);
        setUser(session.user);

        // Buscar dados do usuário na tabela users
        console.log('👤 Buscando dados do usuário...');
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

        if (userError) {
          console.error('⚠️ Erro ao buscar dados do usuário:', userError);
          console.log('🔧 Assumindo role padrão: client');
          setUserRole('client');
        } else {
          console.log('✅ Role do usuário:', userData.role);
          setUserRole(userData.role);
        }

        // Verificar se o usuário tem o papel necessário
        if (requiredRole && userData?.role !== requiredRole) {
          console.log('🚫 Role não autorizado:', { required: requiredRole, actual: userData?.role });
          router.push('/dashboard');
          return;
        }

        console.log('✅ Usuário autorizado!');

      } catch (error) {
        if (mountedRef.current) {
          console.error('💥 Erro na verificação de autenticação:', error);
          router.push(redirectTo);
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
          router.push(redirectTo);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('🚪 Usuário logado');
          setUser(session.user);
          
          // Buscar dados do usuário
          console.log('👤 Buscando dados do usuário no auth change...');
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          console.log('📊 Dados do usuário no auth change:', userData);

          if (mountedRef.current) {
            setUserRole(userData?.role || 'client');
          }
        }
      }
    );

    return () => {
      console.log('🧹 Limpando AuthGuard...');
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // ✅ Dependências vazias para evitar re-renders

  // Cleanup no unmount
  useEffect(() => {
    console.log('🎬 AuthGuard montado');
    return () => {
      console.log('🎬 AuthGuard desmontado');
      mountedRef.current = false;
    };
  }, []);

  console.log('🎨 Renderizando AuthGuard:', { loading, user: !!user, userRole });

  if (loading) {
    console.log('⏳ Mostrando loading...');
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        {/* <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div> */}
      </div>
    );
  }

  if (!user) {
    console.log('🚫 Usuário não encontrado, não renderizando...');
    return null; // O redirecionamento já foi feito
  }

  console.log('✅ Renderizando children');
  return <>{children}</>;
}