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

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error || !session?.user) {
          if (isMounted) {
            router.push(`${redirectTo}?redirectTo=${window.location.pathname}`);
          }
          return;
        }

        setUser(session.user);

        // Buscar dados do usuário apenas se necessário para verificação de role
        if (requiredRole) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (!isMounted) return;

          const userActualRole = userData?.role || 'client';
          setUserRole(userActualRole);

          // Verificar se o usuário tem o papel necessário
          if (requiredRole && userActualRole !== requiredRole) {
            if (isMounted) {
              router.push('/acesso-negado');
            }
            return;
          }
        }

        setIsAuthorized(true);

      } catch (error) {
        if (isMounted) {
          router.push(`${redirectTo}?redirectTo=${window.location.pathname}&reason=auth_error`);
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
        <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
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