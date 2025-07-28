'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Função para limpar localStorage se necessário
    const clearLocalStorageIfNeeded = () => {
      if (typeof window === 'undefined') return;
      
      try {
        // Verificar se há dados corrompidos no localStorage
        const sessionData = localStorage.getItem('be-fest-session');
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          const now = Date.now();
          
          // Se a sessão expirou, limpar
          if (parsed.expiresAt && now > parsed.expiresAt) {
            localStorage.removeItem('be-fest-session');
            localStorage.removeItem('be-fest-user-data');
            console.log('Sessão expirada removida do localStorage');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar localStorage:', error);
        // Se há erro ao ler, limpar dados possivelmente corrompidos
        localStorage.removeItem('be-fest-session');
        localStorage.removeItem('be-fest-user-data');
      }
    };

    // Limpar localStorage se necessário
    clearLocalStorageIfNeeded();

    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
          setSession(null);
        } else {
          setSession(session);
        }
      } catch (error) {
        console.error('Erro inesperado ao obter sessão:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('SessionProvider: Auth state change', { event, session: !!session });
        
        if (event === 'SIGNED_OUT') {
          // Limpar localStorage ao fazer logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('be-fest-session');
            localStorage.removeItem('be-fest-user-data');
          }
        }
        
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}; 