'use client';

import { useEffect, useState } from 'react';
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
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          router.push(redirectTo);
          return;
        }

        if (!session) {
          router.push(redirectTo);
          return;
        }

        if (isMounted) {
          setUser(session.user);
        }

        // Buscar dados do usuário na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!isMounted) return;

        if (userError) {
          console.error('Erro ao buscar dados do usuário:', userError);
          // Se não encontrar o usuário na tabela, pode ser que ainda não foi criado
          // Vamos assumir que é um cliente por padrão
          setUserRole('client');
        } else {
          setUserRole(userData.role);
        }

        // Verificar se o usuário tem o papel necessário
        if (requiredRole && userData?.role !== requiredRole) {
          router.push('/dashboard'); // Redirecionar para dashboard padrão
          return;
        }

      } catch (error) {
        if (isMounted) {
          console.error('Erro na verificação de autenticação:', error);
          router.push(redirectTo);
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
          router.push(redirectTo);
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          
          // Buscar dados do usuário
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (isMounted) {
            setUserRole(userData?.role || 'client');
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, redirectTo, requiredRole, supabase]);

  if (loading) {
          return (
        <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  if (!user) {
    return null; // O redirecionamento já foi feito
  }

  return <>{children}</>;
} 