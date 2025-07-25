'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  // Ref para prevenir múltiplos toasts de sessão expirada
  const sessionExpiredToastShownRef = useRef(false);

  console.log('useAuth: Estado atual', { 
    user: !!user, 
    userData: !!userData, 
    loading, 
    error 
  });

  // Função para lidar com JWT expirado
  const handleJWTExpired = async () => {
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
  };

  // Função para verificar políticas RLS
  const checkRLSPolicies = async (userId: string) => {
    try {
      console.log('Verificando políticas RLS...');
      
      // Tentar uma query simples para verificar permissões
      const { data, error } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', userId)
        .limit(1);

      if (error) {
        console.error('Erro ao verificar políticas RLS:', {
          error,
          message: error.message,
          code: error.code,
          details: error.details
        });
        
        if (error.code === 'PGRST116') {
          console.error('Política RLS bloqueando acesso');
          return false;
        }
        
        return false;
      }
      
      console.log('Políticas RLS funcionando corretamente');
      return true;
    } catch (error) {
      console.error('Erro ao verificar políticas RLS:', error);
      return false;
    }
  };

  // Função para verificar e criar usuário se necessário
  const ensureUserExists = async (userId: string, email: string) => {
    try {
      console.log('Verificando se usuário existe na tabela users...');
      
      // Verificar políticas RLS primeiro
      const rlsWorking = await checkRLSPolicies(userId);
      if (!rlsWorking) {
        console.error('Políticas RLS não estão funcionando corretamente');
        return false;
      }
      
      // Primeiro, tentar buscar o usuário
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Usuário não existe, criar registro
        console.log('Usuário não encontrado, criando registro...');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            role: 'client',
            email: email,
            full_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erro ao criar usuário:', insertError);
          return false;
        }

        console.log('Usuário criado com sucesso');
        return true;
      } else if (fetchError) {
        console.error('Erro ao verificar usuário:', fetchError);
        return false;
      } else {
        console.log('Usuário já existe na tabela');
        return true;
      }
    } catch (error) {
      console.error('Erro ao verificar/criar usuário:', error);
      return false;
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      console.log('Buscando dados do usuário para ID:', userId);
      
      // Verificar se o userId é válido
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('ID do usuário inválido:', userId);
        setError('ID do usuário inválido');
        setLoading(false);
        return;
      }
      
      // Verificar se o usuário está autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Sessão atual:', session ? 'Existe' : 'Não existe', sessionError);
      
      if (sessionError) {
        console.error('Erro ao verificar sessão:', sessionError);
        setError('Erro ao verificar autenticação');
        setLoading(false);
        return;
      }
      
      if (!session) {
        console.log('Nenhuma sessão encontrada');
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      // Verificar se o usuário da sessão corresponde ao userId
      if (session.user.id !== userId) {
        console.error('ID da sessão não corresponde ao userId:', {
          sessionUserId: session.user.id,
          requestedUserId: userId
        });
        setError('Inconsistência na autenticação');
        setLoading(false);
        return;
      }

      // Verificar se o usuário existe na tabela users
      const userExists = await ensureUserExists(userId, session.user.email || '');
      if (!userExists) {
        console.error('Falha ao verificar/criar usuário na tabela');
        setError('Erro ao acessar dados do usuário');
        setLoading(false);
        return;
      }

      console.log('Tentando buscar dados do usuário...');
      
      // Timeout de segurança: 8 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout na busca de dados do usuário'));
        }, 8000);
      });

      const userDataPromise = supabase
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

      const { data: userData, error: userError } = await Promise.race([
        userDataPromise,
        timeoutPromise
      ]) as any;

      console.log('Resultado da query:', { 
        userData: userData ? 'Dados encontrados' : 'Nenhum dado', 
        userError: userError ? {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code
        } : null
      });

      if (userError) {
        console.error('Erro detalhado ao buscar dados do usuário:', {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code,
          userId,
          sessionExists: !!session
        });
        
        // Verificar se é erro de JWT expirado
        if (isJWTExpiredError(userError)) {
          await handleJWTExpired();
          return;
        }
        
        // Verificar se é erro de RLS (Row Level Security)
        if (userError.code === 'PGRST116' || userError.message?.includes('permission denied')) {
          console.error('Erro de permissão RLS detectado');
          setError('Erro de permissão: Verifique se você tem acesso aos dados');
          setLoading(false);
          return;
        }
        
        // Verificar se é erro de registro não encontrado
        if (userError.code === 'PGRST116' || userError.message?.includes('No rows found')) {
          console.error('Usuário não encontrado na tabela users');
          setError('Perfil de usuário não encontrado. Tente fazer login novamente.');
          setLoading(false);
          return;
        }
        
        setError(`Erro ao carregar dados do usuário: ${userError.message || 'Erro desconhecido'}`);
        setLoading(false);
      } else if (!userData) {
        console.error('Dados do usuário retornaram null/undefined');
        setError('Dados do usuário não encontrados');
        setLoading(false);
      } else {
        console.log('Dados do usuário carregados com sucesso:', {
          id: userData.id,
          role: userData.role,
          full_name: userData.full_name,
          email: userData.email
        });
        setUserData(userData);
        setLoading(false);
      }
    } catch (fetchError) {
      console.error('Erro ao buscar dados do usuário:', {
        error: fetchError,
        message: fetchError instanceof Error ? fetchError.message : 'Erro desconhecido',
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
        userId
      });
      
      // Verificar se é erro de JWT expirado
      if (isJWTExpiredError(fetchError)) {
        await handleJWTExpired();
        return;
      }
      
      // Verificar se é erro de timeout
      if (fetchError instanceof Error && fetchError.message.includes('Timeout')) {
        setError('Tempo limite excedido ao carregar dados. Tente novamente.');
      } else {
        setError(`Erro ao carregar dados do usuário: ${fetchError instanceof Error ? fetchError.message : 'Erro desconhecido'}`);
      }
      
      setLoading(false);
    }
  };

  // Função para obter sessão inicial
  const getInitialSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Timeout de segurança: 10 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout na verificação de autenticação'));
        }, 10000);
      });

      const sessionPromise = supabase.auth.getSession();
      
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (sessionError) {
        // Verificar se é erro de JWT expirado
        if (isJWTExpiredError(sessionError)) {
          await handleJWTExpired();
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
      console.error('Erro na inicialização da autenticação:', error);
      
      // Verificar se é erro de JWT expirado
      if (isJWTExpiredError(error)) {
        await handleJWTExpired();
        return;
      }
      
      setError('Erro inesperado na autenticação');
    } finally {
      setLoading(false);
    }
  };

  // Effect para sessão inicial
  useEffect(() => {
    getInitialSession();
  }, []);

  // Effect para escutar mudanças na autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state change', { event, session: !!session });
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('useAuth: Usuário deslogado');
          setUser(null);
          setUserData(null);
          setError(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('useAuth: Usuário logado');
          setUser(session.user);
          await fetchUserData(session.user.id);
          // Reset flag para permitir novos toasts de sessão expirada
          sessionExpiredToastShownRef.current = false;
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('useAuth: Token atualizado');
          setLoading(false);
        } else {
          console.log('useAuth: Outro evento de auth', event);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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