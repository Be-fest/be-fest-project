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
  cpf: string | null;
  cnpj: string | null;
  area_of_operation: string | null;
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
  
  // Ref para prevenir múltiplos toasts de sessão expirada
  const sessionExpiredToastShownRef = useRef(false);
  
  // Ref para prevenir múltiplas chamadas de getInitialSession
  const initialSessionLoadedRef = useRef(false);
  
  // Ref para prevenir múltiplas chamadas de fetchUserData
  const fetchingUserDataRef = useRef(false);

  // Função para lidar com JWT expirado
  const handleJWTExpired = useCallback(async () => {
    // Prevenir múltiplos toasts
    if (sessionExpiredToastShownRef.current) {
      return;
    }
    
    sessionExpiredToastShownRef.current = true;
    
    try {
      // Mostrar toast de sessão expirada
      toast.warning(
        'Sessão Expirada',
        'Sua sessão expirou. Você será redirecionado para fazer login novamente.',
        6000
      );

      // Fazer logout
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      setError(null);
      
      // Aguardar um pouco para o usuário ver o toast
      setTimeout(() => {
        // Usar localStorage como fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('sessionExpired', 'true');
          router.push('/auth/login');
        }
      }, 2000);
      
    } catch (logoutError) {
      console.error('Erro ao fazer logout após JWT expirado:', logoutError);
      
      // Mostrar toast de erro
      toast.error(
        'Erro de Sessão',
        'Houve um problema ao encerrar sua sessão. Você será redirecionado para o login.',
        4000
      );
      
      // Forçar redirecionamento mesmo se o logout falhar
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sessionExpired', 'true');
          window.location.href = '/auth/login';
        }
      }, 2000);
    }
  }, [supabase, router, toast]);

  // Função para buscar dados do usuário
  const fetchUserData = useCallback(async (userId: string) => {
    // Prevenir múltiplas chamadas simultâneas
    if (fetchingUserDataRef.current) {
      return;
    }
    
    fetchingUserDataRef.current = true;
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role, full_name, email, organization_name, profile_image, whatsapp_number, cpf, cnpj, area_of_operation')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        
        // Verificar se é erro de JWT expirado
        if (isJWTExpiredError(userError)) {
          handleJWTExpired();
          return;
        }
        
        setError('Erro ao carregar dados do usuário');
      } else {
        setUserData(userData);
        setError(null); // Limpar erro em caso de sucesso
      }
    } catch (fetchError) {
      console.error('Erro ao buscar dados do usuário:', fetchError);
      
      // Verificar se é erro de JWT expirado
      if (isJWTExpiredError(fetchError)) {
        handleJWTExpired();
        return;
      }
      
      setError('Erro ao carregar dados do usuário');
    } finally {
      fetchingUserDataRef.current = false;
    }
  }, [supabase, handleJWTExpired]);

  // Função para obter sessão inicial
  const getInitialSession = useCallback(async () => {
    // Prevenir múltiplas chamadas
    if (initialSessionLoadedRef.current) {
      return;
    }
    
    initialSessionLoadedRef.current = true;
    
    try {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        // Verificar se é erro de JWT expirado
        if (isJWTExpiredError(sessionError)) {
          handleJWTExpired();
          return;
        }
        
        setError('Erro ao verificar autenticação');
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
        setUserData(null);
      }
    } catch (error) {
      // Verificar se é erro de JWT expirado
      if (isJWTExpiredError(error)) {
        handleJWTExpired();
        return;
      }
      
      setError('Erro inesperado na autenticação');
    } finally {
      setLoading(false);
    }
  }, [supabase, handleJWTExpired, fetchUserData]);

  // Effect para sessão inicial
  useEffect(() => {
    // Adicionar timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout - forçando loading = false');
        setLoading(false);
      }
    }, 10000); // 10 segundos

    getInitialSession();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Dependência vazia para rodar apenas uma vez

  // Effect para escutar mudanças na autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setUserData(null);
          setError(null);
          initialSessionLoadedRef.current = false; // Reset flag
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          await fetchUserData(session.user.id);
          // Reset flag para permitir novos toasts de sessão expirada
          sessionExpiredToastShownRef.current = false;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Dependência vazia, as funções são estáveis

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      setError(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role, full_name, email, organization_name, profile_image, whatsapp_number, cpf, cnpj, area_of_operation')
        .eq('id', user.id)
        .single();

      if (userError) {
        // Verificar se é erro de JWT expirado
        if (isJWTExpiredError(userError)) {
          await handleJWTExpired();
          return;
        }
      } else {
        setUserData(userData);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      
      // Verificar se é erro de JWT expirado
      if (isJWTExpiredError(error)) {
        await handleJWTExpired();
        return;
      }
    }
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