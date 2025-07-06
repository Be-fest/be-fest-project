'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserData {
  id: string;
  role: string;
  full_name: string | null;
  email: string | null;
  organization_name: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao buscar sessão:', sessionError);
          setError('Erro ao verificar autenticação');
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Buscar dados do usuário na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role, full_name, email, organization_name')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
            setError('Erro ao carregar dados do usuário');
          } else {
            setUserData(userData);
          }
        }
      } catch (error) {
        console.error('Erro na autenticação:', error);
        setError('Erro inesperado na autenticação');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setUserData(null);
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          
          // Buscar dados do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role, full_name, email, organization_name')
            .eq('id', session.user.id)
            .single();

          if (!userError) {
            setUserData(userData);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

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
        .select('id, role, full_name, email, organization_name')
        .eq('id', user.id)
        .single();

      if (!userError) {
        setUserData(userData);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
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