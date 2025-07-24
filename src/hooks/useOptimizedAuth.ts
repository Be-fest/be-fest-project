'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

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

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export function useOptimizedAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
    error: null,
    isInitialized: false
  });
  
  const supabase = createClient();
  const mountedRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const initializingRef = useRef(false);

  // Função segura para atualizar estado
  const safeSetState = useCallback((updates: Partial<AuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  // Função para buscar dados do usuário
  const fetchUserData = useCallback(async (userId: string): Promise<UserData | null> => {
    if (!mountedRef.current) return null;
    
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

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição de dados do usuário:', error);
      return null;
    }
  }, [supabase]);

  // Função para processar mudança de sessão
  const handleSessionChange = useCallback(async (session: any) => {
    if (!mountedRef.current) return;

    // Limpar qualquer timeout de loading anterior
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Definir um timeout para garantir que o loading não fique preso
    loadingTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        safeSetState({ loading: false, isInitialized: true });
      }
    }, 3000); // 3 segundos de timeout máximo

    if (session?.user) {
      // Primeiro, definir o usuário
      safeSetState({
        user: session.user,
        loading: true
      });

      // Depois, buscar os dados do usuário
      const userData = await fetchUserData(session.user.id);
      
      if (mountedRef.current) {
        safeSetState({
          userData,
          loading: false,
          error: userData ? null : 'Erro ao carregar dados do usuário',
          isInitialized: true
        });
      }
    } else {
      safeSetState({
        user: null,
        userData: null,
        loading: false,
        error: null,
        isInitialized: true
      });
    }
  }, [fetchUserData, safeSetState]);

  // Inicialização
  useEffect(() => {
    mountedRef.current = true;

    const initializeAuth = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          safeSetState({
            user: null,
            userData: null,
            loading: false,
            error: 'Erro ao verificar autenticação',
            isInitialized: true
          });
          return;
        }

        await handleSessionChange(session);
      } catch (error) {
        console.error('Erro na inicialização:', error);
        safeSetState({
          user: null,
          userData: null,
          loading: false,
          error: 'Erro inesperado',
          isInitialized: true
        });
      } finally {
        initializingRef.current = false;
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
        console.log('Auth state changed:', event);
        
        // Reset do estado de inicialização para eventos importantes
        if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
          initializingRef.current = false;
        }
        
        await handleSessionChange(session);
      }
    );

    return () => {
      mountedRef.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [supabase, handleSessionChange, safeSetState]);

  return {
    ...state,
    isAuthenticated: !!state.user,
    hasUserData: !!state.userData,
    userDisplayName: state.userData?.full_name || state.user?.email?.split('@')[0] || 'Usuário',
    userInitial: state.userData?.full_name?.charAt(0).toUpperCase() || 
                 state.user?.email?.charAt(0).toUpperCase() || 'U'
  };
} 