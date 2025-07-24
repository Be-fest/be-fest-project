'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  const mountedRef = useRef(true);
  const sessionCheckedRef = useRef(false);
  const redirectingRef = useRef(false);

  // Função segura para atualizar estado
  const safeSetState = useCallback((
    updates: { user?: User | null; userRole?: string | null; loading?: boolean }
  ) => {
    if (mountedRef.current) {
      if ('user' in updates && updates.user !== undefined) setUser(updates.user);
      if ('userRole' in updates && updates.userRole !== undefined) setUserRole(updates.userRole);
      if ('loading' in updates && updates.loading !== undefined) setLoading(updates.loading);
    }
  }, []);

  // Função para redirecionar com segurança
  const safeRedirect = useCallback((path: string) => {
    if (!redirectingRef.current && mountedRef.current) {
      redirectingRef.current = true;
      router.push(path);
    }
  }, [router]);

  useEffect(() => {
    mountedRef.current = true;
    redirectingRef.current = false;

    const checkAuth = async () => {
      if (sessionCheckedRef.current) return;
      sessionCheckedRef.current = true;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mountedRef.current) return;
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          safeRedirect(redirectTo);
          return;
        }

        if (!session) {
          safeRedirect(redirectTo);
          return;
        }

        safeSetState({ user: session.user });

        // Buscar dados do usuário na tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!mountedRef.current) return;

        if (userError) {
          console.error('Erro ao buscar dados do usuário:', userError);
          safeSetState({ userRole: 'client' });
        } else {
          safeSetState({ userRole: userData.role });
        }

        // Verificar se o usuário tem o papel necessário
        if (requiredRole && userData?.role !== requiredRole) {
          safeRedirect('/dashboard');
          return;
        }

      } catch (error) {
        if (mountedRef.current) {
          console.error('Erro na verificação de autenticação:', error);
          safeRedirect(redirectTo);
        }
      } finally {
        if (mountedRef.current) {
          safeSetState({ loading: false });
        }
      }
    };

    checkAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
        if (event === 'SIGNED_OUT' || !session) {
          safeSetState({
            user: null,
            userRole: null,
            loading: false
          });
          sessionCheckedRef.current = false;
          safeRedirect(redirectTo);
        } else if (event === 'SIGNED_IN' && session) {
          safeSetState({ user: session.user });
          
          // Buscar dados do usuário
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (mountedRef.current) {
            const newRole = userData?.role || 'client';
            safeSetState({ userRole: newRole });

            // Verificar se o usuário tem o papel necessário
            if (requiredRole && newRole !== requiredRole) {
              safeRedirect('/dashboard');
            }
          }
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [router, redirectTo, requiredRole, supabase, safeSetState, safeRedirect]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
} 