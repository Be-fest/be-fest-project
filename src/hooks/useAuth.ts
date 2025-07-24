'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

interface UserData {
  id: string;
  role: string;
  full_name: string | null;
  email: string | null;
  organization_name: string | null;
  profile_image: string | null;
  whatsapp_number: string | null;
  area_of_operation: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  created_at: string;
  updated_at: string;
}

// Função para verificar se o erro é de JWT expirado
const isJWTExpiredError = (error: any): boolean => {
  return (
    error?.code === 'PGRST301' ||
    error?.message?.includes('JWT expired') ||
    error?.message?.includes('jwt expired')
  );
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToastGlobal();
  const supabase = createClient();
  
  const sessionExpiredToastShownRef = useRef(false);
  const sessionCheckedRef = useRef(false);
  const mountedRef = useRef(true);

  // Função para atualizar estado com segurança
  const safeSetState = useCallback((updates: {
    user?: User | null;
    userData?: UserData | null;
    loading?: boolean;
    error?: string | null;
  }) => {
    if (mountedRef.current) {
      if ('user' in updates && updates.user !== undefined) setUser(updates.user);
      if ('userData' in updates && updates.userData !== undefined) setUserData(updates.userData);
      if ('loading' in updates && updates.loading !== undefined) setLoading(updates.loading);
      if ('error' in updates && updates.error !== undefined) setError(updates.error);
    }
  }, []);

  // Função para buscar dados do usuário
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, 
          role, 
          full_name, 
          email, 
          organization_name, 
          profile_image,
          whatsapp_number,
          area_of_operation,
          address,
          city,
          state,
          postal_code,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      safeSetState({ userData: data });
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      safeSetState({ error: 'Erro ao carregar dados do usuário' });
      return null;
    }
  }, [supabase, safeSetState]);

  // Função para lidar com JWT expirado
  const handleJWTExpired = useCallback(async () => {
    if (sessionExpiredToastShownRef.current) return;
    sessionExpiredToastShownRef.current = true;
    
    try {
      toast.warning(
        'Sessão Expirada',
        'Sua sessão expirou. Você será redirecionado para fazer login novamente.',
        6000
      );

      await supabase.auth.signOut();
      safeSetState({
        user: null,
        userData: null,
        error: null,
        loading: false
      });
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sessionExpired', 'true');
          router.push('/auth/login');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao fazer logout após JWT expirado:', error);
      safeSetState({ loading: false });
      
      toast.error(
        'Erro de Sessão',
        'Houve um problema ao encerrar sua sessão. Você será redirecionado para o login.',
        4000
      );
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sessionExpired', 'true');
          window.location.href = '/auth/login';
        }
      }, 2000);
    }
  }, [supabase, router, toast, safeSetState]);

  // Função para obter sessão inicial
  const getInitialSession = useCallback(async () => {
    if (sessionCheckedRef.current) return;
    sessionCheckedRef.current = true;

    try {
      safeSetState({ loading: true, error: null });

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        if (isJWTExpiredError(sessionError)) {
          await handleJWTExpired();
          return;
        }
        throw sessionError;
      }

      if (session?.user) {
        safeSetState({ user: session.user });
        await fetchUserData(session.user.id);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      safeSetState({ error: 'Erro ao verificar autenticação' });
    } finally {
      safeSetState({ loading: false });
    }
  }, [supabase, handleJWTExpired, fetchUserData, safeSetState]);

  // Effect para sessão inicial e listener de mudanças
  useEffect(() => {
    mountedRef.current = true;
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session) {
          safeSetState({
            user: null,
            userData: null,
            error: null,
            loading: false
          });
          sessionCheckedRef.current = false;
        } else if (event === 'SIGNED_IN' && session) {
          safeSetState({ user: session.user });
          await fetchUserData(session.user.id);
          sessionExpiredToastShownRef.current = false;
          safeSetState({ loading: false });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          safeSetState({ user: session.user });
          await fetchUserData(session.user.id);
          sessionExpiredToastShownRef.current = false;
          safeSetState({ loading: false });
        } else if (event === 'USER_UPDATED' && session) {
          safeSetState({ user: session.user });
          await fetchUserData(session.user.id);
          safeSetState({ loading: false });
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase, getInitialSession, fetchUserData, safeSetState]);

  const signOut = async () => {
    try {
      safeSetState({ loading: true });
      await supabase.auth.signOut();
      safeSetState({
        user: null,
        userData: null,
        error: null,
        loading: false
      });
      sessionCheckedRef.current = false;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      safeSetState({
        error: 'Erro ao fazer logout',
        loading: false
      });
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    await fetchUserData(user.id);
  };

  return {
    user,
    userData,
    loading,
    error,
    signOut,
    refreshUserData,
    isAuthenticated: !!user,
    isClient: userData?.role === 'client',
    isProvider: userData?.role === 'provider',
    isAdmin: userData?.role === 'admin',
  };
} 