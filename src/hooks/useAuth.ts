'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { 
  isJWTExpiredError, 
  isNetworkError, 
  isPermissionError, 
  isNotFoundError,
  getFriendlyErrorMessage,
  shouldRetry,
  getRetryDelay,
  safeLogError
} from '@/utils/errorUtils';

interface UserData {
  id: string;
  role: string;
  full_name: string | null;
  email: string | null;
  organization_name: string | null;
  organization_description: string | null;
  profile_image: string | null;
  whatsapp_number: string | null;
  area_of_operation: string | null;
  cnpj: string | null;
  cpf: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  address: string | null;
  coordenates: {
    latitude: number;
    longitude: number;
    raio_atuacao: number;
  } | null;
  latitude?: number;
  longitude?: number;
  raio_atuacao?: number;
  created_at: string;
  updated_at: string;
}

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
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const isInitializingRef = useRef(false);

  console.log('useAuth: Estado atual', { 
    user: !!user, 
    userData: !!userData, 
    loading, 
    error,
    retryCount: retryCountRef.current
  });

  const handleJWTExpired = async () => {
    if (sessionExpiredToastShownRef.current) {
      return;
    }
    
    sessionExpiredToastShownRef.current = true;
    
    try {
      toast.warning(
        'Sessão Expirada',
        'Sua sessão expirou. Você será redirecionado para fazer login novamente.',
        6000
      );

      clearStoredSession();
      
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      setError(null);
      retryCountRef.current = 0;
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (logoutError) {
      safeLogError('Erro ao fazer logout após JWT expirado:', logoutError);
      
      toast.error(
        'Erro de Sessão',
        'Houve um problema ao encerrar sua sessão. Você será redirecionado para o login.',
        4000
      );
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }
  };

  // Função para verificar e criar usuário se necessário
  const ensureUserExists = async (userId: string, email: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando se usuário existe na tabela users...');
      
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
          safeLogError('❌ Erro ao criar usuário:', insertError);
          return false;
        }

        console.log('✅ Usuário criado com sucesso');
        return true;
      } else if (fetchError) {
        safeLogError('❌ Erro ao verificar usuário:', fetchError);
        return false;
      } else {
        console.log('✅ Usuário já existe na tabela');
        return true;
      }
    } catch (error) {
      safeLogError('💥 Erro inesperado ao verificar/criar usuário:', error);
      return false;
    }
  };

  const fetchUserData = async (userId: string, retryAttempt = 0): Promise<void> => {
    try {
      console.log(`🔄 fetchUserData iniciado para userId: ${userId} (tentativa ${retryAttempt + 1})`);
      
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
        safeLogError('❌ Erro ao verificar sessão:', sessionError);
        
        if (isJWTExpiredError(sessionError)) {
          await handleJWTExpired();
          return;
        }
        
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
        
        if (shouldRetry(null, retryAttempt, maxRetries)) {
          const delay = getRetryDelay(retryAttempt);
          console.log(`🔄 Tentando novamente em ${delay}ms... (${retryAttempt + 1}/${maxRetries})`);
          setTimeout(() => {
            fetchUserData(userId, retryAttempt + 1);
          }, delay);
          return;
        }
        
        setError('Erro ao acessar dados do usuário');
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando dados do usuário na tabela users...');
      
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
        safeLogError('❌ Erro na query users:', userError);
        
        // Verificar se é erro de JWT expirado
        if (isJWTExpiredError(userError)) {
          console.log('🔄 JWT expirado, redirecionando...');
          await handleJWTExpired();
          return;
        }
        
        // Verificar se deve tentar novamente
        if (shouldRetry(userError, retryAttempt, maxRetries)) {
          const delay = getRetryDelay(retryAttempt);
          console.log(`🔄 Tentando novamente em ${delay}ms... (${retryAttempt + 1}/${maxRetries})`);
          setTimeout(() => {
            fetchUserData(userId, retryAttempt + 1);
          }, delay);
          return;
        }
        
        setError(getFriendlyErrorMessage(userError));
        setLoading(false);
        return;
      }

      if (!userData) {
        console.error('❌ Dados do usuário retornaram null/undefined');
        
        if (shouldRetry(null, retryAttempt, maxRetries)) {
          const delay = getRetryDelay(retryAttempt);
          console.log(`🔄 Dados nulos, tentando novamente em ${delay}ms... (${retryAttempt + 1}/${maxRetries})`);
          setTimeout(() => {
            fetchUserData(userId, retryAttempt + 1);
          }, delay);
          return;
        }
        
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
      setError(null);
      retryCountRef.current = 0;
      setLoading(false);
      
    } catch (fetchError) {
      safeLogError('💥 Erro inesperado em fetchUserData:', fetchError);
      
      // Verificar se é erro de JWT expirado
      if (isJWTExpiredError(fetchError)) {
        console.log('🔄 JWT expirado (catch), redirecionando...');
        await handleJWTExpired();
        return;
      }
      
      // Verificar se deve tentar novamente
      if (shouldRetry(fetchError, retryAttempt, maxRetries)) {
        const delay = getRetryDelay(retryAttempt);
        console.log(`🔄 Tentando novamente em ${delay}ms... (${retryAttempt + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchUserData(userId, retryAttempt + 1);
        }, delay);
        return;
      }
      
      setError(getFriendlyErrorMessage(fetchError));
      setLoading(false);
    } finally {
      isInitializingRef.current = false;
    }
  };

  // Função para obter sessão inicial
  const getInitialSession = async () => {
    // Evitar múltiplas chamadas simultâneas
    if (isInitializingRef.current) {
      console.log('🔄 useAuth: Inicialização já em andamento, ignorando...');
      return;
    }
    
    isInitializingRef.current = true;
    
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
        // Finalizar loading imediatamente quando userData está disponível
        setLoading(false);
        
        // Verificar se a sessão ainda é válida no Supabase em background
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            console.log('Sessão do localStorage inválida, fazendo logout');
            clearStoredSession();
            setUser(null);
            setUserData(null);
            setLoading(false);
            return;
          }
          
          // Atualizar dados do usuário se necessário (em background)
          if (session.user.id === storedUserData.id) {
            // Não aguardar fetchUserData para não bloquear a UI
            fetchUserData(session.user.id).catch(console.error);
          } else {
            console.log('ID do usuário mudou, recarregando dados');
            setUser(session.user);
            await fetchUserData(session.user.id);
          }
        } catch (sessionCheckError) {
          console.error('Erro ao verificar sessão:', sessionCheckError);
          clearStoredSession();
          setUser(null);
          setUserData(null);
          setLoading(false);
        }
        return;
      }

      // Se não há dados no localStorage, verificar no Supabase
      console.log('Verificando sessão no Supabase');
      
      // Verificar sessão com timeout simples
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
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
        setLoading(false);
      }
    } catch (error) {
      // Usar safeLogError para tratamento seguro do erro
      safeLogError('💥 Erro inesperado em getInitialSession:', error, 'getInitialSession');
      
      // Verificar se é erro de timeout
      if (error instanceof Error && error.message.includes('Timeout na verificação')) {
        console.warn('⏰ Timeout na verificação de autenticação - continuando sem usuário');
        setUser(null);
        setUserData(null);
        clearStoredSession();
        setError(null); // Não mostrar erro para timeout
      } else if (isNetworkError(error)) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError('Erro ao inicializar autenticação');
      }
      
      setLoading(false);
    } finally {
      isInitializingRef.current = false;
    }
  };

  // Effect para sessão inicial
  useEffect(() => {
    getInitialSession();
  }, []);

  // Effect para finalizar loading quando userData está disponível
  useEffect(() => {
    if (userData && loading) {
      console.log('useAuth: userData disponível, finalizando loading');
      setLoading(false);
    }
  }, [userData, loading]);

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
          
          // Verificar se já temos userData no localStorage para este usuário
          const storedUserData = getStoredUserData();
          if (storedUserData && storedUserData.id === session.user.id) {
            console.log('useAuth: Usando userData do localStorage');
            setUserData(storedUserData);
            setLoading(false);
            // Atualizar dados em background
            fetchUserData(session.user.id).catch(console.error);
          } else {
            // Buscar dados do usuário
            await fetchUserData(session.user.id);
          }
          
          // Reset flag para permitir novos toasts de sessão expirada
          sessionExpiredToastShownRef.current = false;
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('useAuth: Token atualizado');
          if (session) {
            setStoredSession(session);
          }
          // Não alterar loading aqui, manter estado atual
        } else {
          console.log('useAuth: Outro evento de auth', event);
          // Não alterar loading para eventos desconhecidos
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🔴 Iniciando logout do useAuth...');
      
      // Resetar flags de controle
      isInitializingRef.current = false;
      sessionExpiredToastShownRef.current = false;
      retryCountRef.current = 0;
      
      // Limpar dados locais imediatamente
      clearStoredSession();
      setUser(null);
      setUserData(null);
      setError(null);
      setLoading(false);
      
      // Fazer logout no Supabase de forma assíncrona (não esperar)
      supabase.auth.signOut().catch(error => {
        console.warn('⚠️ Erro no signOut do Supabase (ignorado):', error);
      });
      
      console.log('✅ Logout realizado com sucesso no useAuth');
      
      // Redirecionamento imediato
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login?reason=useauth_logout');
      }
      
    } catch (error) {
      console.error('❌ Erro ao fazer logout no useAuth:', error);
      
      // Mesmo com erro, forçar redirecionamento
      if (typeof window !== 'undefined') {
        window.location.replace('/auth/login?reason=useauth_error');
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Tentando fazer login com:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Erro no login:', error);
        throw new Error(error.message);
      }
      
      if (data.user) {
        console.log('Login realizado com sucesso para usuário:', data.user.id);
        setUser(data.user);
        setStoredSession(data.session);
        
        // Buscar dados do usuário
        await fetchUserData(data.user.id);
        
        // Retornar dados completos incluindo userData
        return {
          ...data,
          userData: getStoredUserData()
        };
      }
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no login';
      console.error('Erro no login:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Atualizando dados do usuário...');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          role,
          full_name,
          email,
          organization_name,
          organization_description,
          profile_image,
          whatsapp_number,
          area_of_operation,
          cnpj,
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
        
        // Verificar se é erro de rede
        if (isNetworkError(userError)) {
          console.error('❌ Erro de rede ao atualizar dados do usuário');
          setError('Erro de conexão ao atualizar dados');
          return;
        }
        
        console.error('❌ Erro ao atualizar dados do usuário:', userError);
        setError('Erro ao atualizar dados do usuário');
        return;
      }

      if (userData) {
        console.log('✅ Dados do usuário atualizados com sucesso');
        setUserData({
          ...userData,
          cpf: null,
          address: null,
          coordenates: null
        } as UserData);
        setStoredUserData({
          ...userData,
          cpf: null,
          address: null,
          coordenates: null
        } as UserData);
        setError(null);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao atualizar dados do usuário:', error);
      setError('Erro inesperado ao atualizar dados');
    }
  };

  const setupAuthHeaders = () => {
    // Função para configurar headers de autenticação se necessário
    return {
      'Content-Type': 'application/json',
    };
  };

  return {
    user,
    userData,
    loading,
    error,
    signIn,
    signOut,
    refreshUserData,
    setupAuthHeaders,
  };
}