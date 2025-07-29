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

// Função segura para logar erros
const safeConsoleError = (message: string, data: any) => {
  try {
    // Verificar se o data é um objeto válido
    if (data && typeof data === 'object') {
      // Remover propriedades que podem causar problemas de serialização
      const safeData = { ...data };
      
      // Garantir que todas as propriedades tenham valores válidos
      Object.keys(safeData).forEach(key => {
        if (safeData[key] === null || safeData[key] === undefined) {
          safeData[key] = 'Valor não disponível';
        }
      });
      
      // Verificar se o objeto não está vazio
      const hasValidData = Object.values(safeData).some(value => 
        value !== null && value !== undefined && value !== ''
      );
      
      if (hasValidData) {
        console.error(message, safeData);
      } else {
        console.error(message, 'Objeto de erro vazio ou inválido');
      }
    } else {
      console.error(message, data || 'Dados não disponíveis');
    }
  } catch (error) {
    console.error(message, 'Erro ao processar dados de erro');
  }
};

// Funções para gerenciar localStorage
const getStoredSession = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem('be-fest-session');
    if (!sessionData) return null;
    
    const parsed = JSON.parse(sessionData);
    const now = Date.now();
    
    // Verificar se a sessão não expirou (24 horas)
    if (parsed.expiresAt && now > parsed.expiresAt) {
      localStorage.removeItem('be-fest-session');
      localStorage.removeItem('be-fest-user-data');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Erro ao ler sessão do localStorage:', error);
    localStorage.removeItem('be-fest-session');
    localStorage.removeItem('be-fest-user-data');
    return null;
  }
};

const setStoredSession = (session: any) => {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionData = {
      ...session,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };
    localStorage.setItem('be-fest-session', JSON.stringify(sessionData));
  } catch (error) {
    console.error('Erro ao salvar sessão no localStorage:', error);
  }
};

const clearStoredSession = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('be-fest-session');
  localStorage.removeItem('be-fest-user-data');
};

const getStoredUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('be-fest-user-data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao ler dados do usuário do localStorage:', error);
    return null;
  }
};

const setStoredUserData = (userData: UserData) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('be-fest-user-data', JSON.stringify(userData));
  } catch (error) {
    console.error('Erro ao salvar dados do usuário no localStorage:', error);
  }
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

  console.log('useAuth: Estado atual', { 
    user: !!user, 
    userData: !!userData, 
    loading, 
    error 
  });

  const handleJWTExpired = async () => {
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

      // Limpar dados do localStorage
      clearStoredSession();
      
      // Fazer logout
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      setError(null);
      
      // Aguardar um pouco para o usuário ver o toast
      setTimeout(() => {
        router.push('/auth/login');
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
        router.push('/auth/login');
      }, 2000);
    }
  };

  // Função para verificar e criar usuário se necessário
  const ensureUserExists = async (userId: string, email: string) => {
    try {
      console.log('🔍 Verificando se usuário existe na tabela users...');
      
      // Primeiro, tentar buscar o usuário
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      console.log('📊 Resultado da verificação:', { 
        hasUser: !!existingUser, 
        hasError: !!fetchError,
        errorMessage: fetchError?.message 
      });

      if (fetchError && fetchError.code === 'PGRST116') {
        // Usuário não existe, criar registro
        console.log('🆕 Usuário não encontrado, criando registro...');
        
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
          console.error('❌ Erro ao criar usuário:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details
          });
          return false;
        }

        console.log('✅ Usuário criado com sucesso');
        return true;
      } else if (fetchError) {
        console.error('❌ Erro ao verificar usuário:', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details
        });
        return false;
      } else {
        console.log('✅ Usuário já existe na tabela');
        return true;
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao verificar/criar usuário:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        name: error instanceof Error ? error.name : 'Erro genérico'
      });
      return false;
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      console.log('🔄 fetchUserData iniciado para userId:', userId);
      
      // Verificar se o userId é válido
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('❌ ID do usuário inválido:', userId);
        setError('ID do usuário inválido');
        setLoading(false);
        return;
      }
      
      // Verificar se o usuário está autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erro ao verificar sessão:', sessionError);
        setError('Erro ao verificar autenticação');
        setLoading(false);
        return;
      }
      
      if (!session) {
        console.log('ℹ️ Nenhuma sessão encontrada');
        setUser(null);
        setUserData(null);
        clearStoredSession();
        setLoading(false);
        return;
      }

      console.log('✅ Sessão válida encontrada para usuário:', session.user.id);

      // Verificar se o usuário da sessão corresponde ao userId
      if (session.user.id !== userId) {
        console.error('❌ ID da sessão não corresponde ao userId:', {
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
        console.error('❌ Falha ao verificar/criar usuário na tabela');
        setError('Erro ao acessar dados do usuário');
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando dados do usuário na tabela users...');
      
      // Query simplificada e mais robusta
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📊 Resultado da query users:', { 
        hasData: !!userData,
        hasError: !!userError,
        errorMessage: userError?.message,
        errorCode: userError?.code,
        userId: userId
      });

      if (userError) {
        // Garantir que sempre temos dados válidos para logar
        const errorInfo = {
          message: userError.message || 'Sem mensagem de erro',
          code: userError.code || 'Sem código de erro',
          details: userError.details || 'Sem detalhes',
          hint: userError.hint || 'Sem dica',
          userId: userId,
          timestamp: new Date().toISOString()
        };
        
        console.error('❌ Erro na query users:', errorInfo);
        
        // Verificar se é erro de JWT expirado
        if (isJWTExpiredError(userError)) {
          console.log('🔄 JWT expirado, redirecionando...');
          await handleJWTExpired();
          return;
        }
        
        // Verificar se é erro de RLS (Row Level Security)
        if (userError.code === 'PGRST116' || userError.message?.includes('permission denied')) {
          console.error('❌ Erro de permissão RLS detectado');
          setError('Erro de permissão: Verifique se você tem acesso aos dados');
          setLoading(false);
          return;
        }
        
        // Verificar se é erro de registro não encontrado
        if (userError.code === 'PGRST116' || userError.message?.includes('No rows found')) {
          console.error('❌ Usuário não encontrado na tabela users');
          setError('Perfil de usuário não encontrado. Tente fazer login novamente.');
          setLoading(false);
          return;
        }
        
        setError(`Erro ao carregar dados do usuário: ${userError.message || 'Erro desconhecido'}`);
        setLoading(false);
        return;
      }

      if (!userData) {
        console.error('❌ Dados do usuário retornaram null/undefined');
        setError('Dados do usuário não encontrados');
        setLoading(false);
        return;
      }

      console.log('✅ Dados do usuário carregados com sucesso:', {
        id: userData.id,
        role: userData.role,
        full_name: userData.full_name,
        email: userData.email
      });

      setUserData(userData);
      setStoredUserData(userData);
      setLoading(false);
      
    } catch (fetchError) {
      console.error('💥 Erro inesperado em fetchUserData:', {
        message: fetchError instanceof Error ? fetchError.message : 'Erro desconhecido',
        name: fetchError instanceof Error ? fetchError.name : 'Erro genérico',
        stack: fetchError instanceof Error ? fetchError.stack : 'Stack não disponível'
      });
      
      // Verificar se é erro de JWT expirado
      if (isJWTExpiredError(fetchError)) {
        console.log('🔄 JWT expirado (catch), redirecionando...');
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

      // Primeiro, tentar carregar dados do localStorage
      const storedSession = getStoredSession();
      const storedUserData = getStoredUserData();

      if (storedSession && storedUserData) {
        console.log('Carregando sessão do localStorage');
        setUser(storedSession.user);
        setUserData(storedUserData);
        setLoading(false);
        
        // Verificar se a sessão ainda é válida no Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log('Sessão do localStorage inválida, fazendo logout');
          clearStoredSession();
          setUser(null);
          setUserData(null);
          setLoading(false);
          return;
        }
        
        // Atualizar dados do usuário se necessário
        if (session.user.id === storedUserData.id) {
          await fetchUserData(session.user.id);
        } else {
          console.log('ID do usuário mudou, recarregando dados');
          setUser(session.user);
          await fetchUserData(session.user.id);
        }
        return;
      }

      // Se não há dados no localStorage, verificar no Supabase
      console.log('Verificando sessão no Supabase');
      
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
        setStoredSession(session);
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
        setUserData(null);
        clearStoredSession();
      }
    } catch (error) {
      const sessionErrorInfo = {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      };
      
      console.error('Erro na inicialização da autenticação:', sessionErrorInfo);
      
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
          clearStoredSession();
          setLoading(false);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('useAuth: Usuário logado');
          setUser(session.user);
          setStoredSession(session);
          await fetchUserData(session.user.id);
          // Reset flag para permitir novos toasts de sessão expirada
          sessionExpiredToastShownRef.current = false;
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('useAuth: Token atualizado');
          if (session) {
            setStoredSession(session);
          }
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
      clearStoredSession();
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      setError(null);
    } catch (error) {
      const logoutErrorInfo = {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      };
      
      console.error('Erro ao fazer logout:', logoutErrorInfo);
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
        setStoredUserData(userData);
      }
    } catch (error) {
      const refreshErrorInfo = {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      };
      
      console.error('Erro ao atualizar dados do usuário:', refreshErrorInfo);
      
      // Verificar se é erro de JWT expirado
      if (isJWTExpiredError(error)) {
        await handleJWTExpired();
        return;
      }
    }
  };

  // Função para configurar headers de autenticação para requisições
  const setupAuthHeaders = () => {
    if (typeof window === 'undefined') return;
    
    // Interceptar todas as requisições fetch para adicionar headers de auth
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const storedSession = getStoredSession();
      
      if (storedSession && init) {
        init.headers = {
          ...init.headers,
          'x-localstorage-auth': 'true'
        };
      }
      
      return originalFetch.call(this, input, init);
    };
  };

  // Effect para configurar headers de autenticação
  useEffect(() => {
    if (user) {
      setupAuthHeaders();
    }
  }, [user]);

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