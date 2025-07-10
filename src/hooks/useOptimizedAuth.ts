'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface OptimizedAuthState {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useOptimizedAuth(requiredRole?: string) {
  const [state, setState] = useState<OptimizedAuthState>({
    user: null,
    userRole: null,
    loading: true,
    isAuthenticated: false
  });

  const router = useRouter();
  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        setState({
          user: null,
          userRole: null,
          loading: false,
          isAuthenticated: false
        });
        return false;
      }

      // Se não precisar do role, não fazer query desnecessária
      if (!requiredRole) {
        setState({
          user: session.user,
          userRole: 'client', // assumir client por padrão
          loading: false,
          isAuthenticated: true
        });
        return true;
      }

      // Só buscar role se necessário
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const userRole = userData?.role || 'client';
      
      setState({
        user: session.user,
        userRole,
        loading: false,
        isAuthenticated: true
      });

      return true;
    } catch (error) {
      setState({
        user: null,
        userRole: null,
        loading: false,
        isAuthenticated: false
      });
      return false;
    }
  }, [supabase, requiredRole]);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setState({
            user: null,
            userRole: null,
            loading: false,
            isAuthenticated: false
          });
        } else if (event === 'SIGNED_IN' && session) {
          checkAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAuth, supabase]);

  return {
    ...state,
    checkAuth
  };
} 