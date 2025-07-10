'use client';

import { useEffect, useState } from 'react';
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
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        console.log('🔍 [CLIENT_AUTH] Verificando autenticação...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('❌ [CLIENT_AUTH] Erro ao verificar sessão:', error);
          // Em caso de erro, redirecionar para login
          timeoutId = setTimeout(() => {
            if (isMounted) {
              router.push(`${redirectTo}?redirectTo=${window.location.pathname}`);
            }
          }, 100);
          return;
        }

        if (!session || !session.user) {
          console.log('🚨 [CLIENT_AUTH] Sessão não encontrada, redirecionando...');
          timeoutId = setTimeout(() => {
            if (isMounted) {
              router.push(`${redirectTo}?redirectTo=${window.location.pathname}`);
            }
          }, 100);
          return;
        }

        console.log('✅ [CLIENT_AUTH] Sessão válida encontrada');
        setUser(session.user);

        // Buscar dados do usuário na tabela users se necessário
        if (requiredRole) {
          console.log('🔍 [CLIENT_AUTH] Verificando role do usuário...');
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, full_name')
            .eq('id', session.user.id)
            .single();

          if (!isMounted) return;

          if (userError) {
            console.error('❌ [CLIENT_AUTH] Erro ao buscar dados do usuário:', userError);
            // Se não encontrar o usuário, assumir que é cliente por padrão
            setUserRole('client');
          } else {
            setUserRole(userData.role);
            console.log('👤 [CLIENT_AUTH] Role do usuário:', userData.role);
          }

          // Verificar se o usuário tem o papel necessário
          const userActualRole = userData?.role || 'client';
          if (requiredRole && userActualRole !== requiredRole) {
            console.log('🚫 [CLIENT_AUTH] Role inadequado, redirecionando...');
            timeoutId = setTimeout(() => {
              if (isMounted) {
                router.push('/acesso-negado');
              }
            }, 100);
            return;
          }
        }

        console.log('✅ [CLIENT_AUTH] Usuário autorizado');
        setIsAuthorized(true);

      } catch (error) {
        if (isMounted) {
          console.error('❌ [CLIENT_AUTH] Erro na verificação de autenticação:', error);
          timeoutId = setTimeout(() => {
            if (isMounted) {
              router.push(`${redirectTo}?redirectTo=${window.location.pathname}&reason=auth_error`);
            }
          }, 100);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔄 [CLIENT_AUTH] Mudança de estado de auth:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setUserRole(null);
          setIsAuthorized(false);
          router.push(`${redirectTo}?reason=signed_out`);
        } else if (event === 'SIGNED_IN' && session) {
          // Recarregar a verificação
          checkAuth();
        }
      }
    );

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, [router, redirectTo, requiredRole, supabase]);

  // Loading state
  if (loading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F71875] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return null; // O redirecionamento já foi feito
  }

  // Authorized
  return <>{children}</>;
} 