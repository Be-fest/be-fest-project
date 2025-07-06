'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SessionManagerOptions {
  warningMinutes?: number; // Minutos antes da expiração para mostrar aviso
  autoRefresh?: boolean; // Se deve tentar renovar automaticamente
  onSessionExpired?: () => void;
  onSessionWarning?: (minutesLeft: number) => void;
}

export function useSessionManager(options: SessionManagerOptions = {}) {
  const {
    warningMinutes = 5,
    autoRefresh = true,
    onSessionExpired,
    onSessionWarning
  } = options;

  const [isSessionExpiring, setIsSessionExpiring] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  const warningShownRef = useRef(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearIntervals = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, []);

  const handleSessionExpired = useCallback(async () => {
    console.log('Sessão expirada, fazendo logout...');
    setIsSessionExpiring(true);
    clearIntervals();
    
    try {
      await supabase.auth.signOut();
      onSessionExpired?.();
      router.push('/auth/login?reason=session_expired');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Forçar redirecionamento mesmo com erro
      router.push('/auth/login?reason=session_expired');
    }
  }, [supabase, router, onSessionExpired, clearIntervals]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        await handleSessionExpired();
        return false;
      }

      if (data.session) {
        console.log('Sessão renovada com sucesso');
        warningShownRef.current = false;
        setShowWarning(false);
        setMinutesLeft(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      await handleSessionExpired();
      return false;
    }
  }, [supabase, handleSessionExpired]);

  const checkSessionExpiry = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        await handleSessionExpired();
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const timeLeft = expiresAt - now;
      const minutesLeft = Math.floor(timeLeft / 60);

      setMinutesLeft(minutesLeft);

      // Se a sessão já expirou
      if (timeLeft <= 0) {
        await handleSessionExpired();
        return;
      }

      // Se está próximo da expiração e ainda não mostrou o aviso
      if (minutesLeft <= warningMinutes && !warningShownRef.current) {
        console.log(`Sessão expira em ${minutesLeft} minutos`);
        warningShownRef.current = true;
        setShowWarning(true);
        onSessionWarning?.(minutesLeft);

        // Se auto-refresh está habilitado, tenta renovar
        if (autoRefresh && minutesLeft <= 2) {
          const refreshed = await refreshSession();
          if (!refreshed) {
            await handleSessionExpired();
          }
        }
      }

    } catch (error) {
      console.error('Erro ao verificar expiração da sessão:', error);
      await handleSessionExpired();
    }
  }, [supabase, warningMinutes, autoRefresh, handleSessionExpired, onSessionWarning, refreshSession]);

  const extendSession = useCallback(async () => {
    const success = await refreshSession();
    if (success) {
      setShowWarning(false);
      warningShownRef.current = false;
    }
    return success;
  }, [refreshSession]);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    // Não resetar warningShownRef para não mostrar o aviso novamente
  }, []);

  useEffect(() => {
    // Verificar imediatamente
    checkSessionExpiry();

    // Verificar a cada 30 segundos
    warningIntervalRef.current = setInterval(checkSessionExpiry, 30000);

    // Auto-refresh a cada 50 minutos (tokens do Supabase duram 1 hora)
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await refreshSession();
        }
      }, 50 * 60 * 1000); // 50 minutos
    }

    return () => {
      clearIntervals();
    };
  }, [checkSessionExpiry, refreshSession, autoRefresh, clearIntervals, supabase]);

  // Escutar mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearIntervals();
          setShowWarning(false);
          setIsSessionExpiring(false);
          setMinutesLeft(null);
          warningShownRef.current = false;
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          warningShownRef.current = false;
          setShowWarning(false);
          setIsSessionExpiring(false);
          setMinutesLeft(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, clearIntervals]);

  return {
    isSessionExpiring,
    showWarning,
    minutesLeft,
    extendSession,
    dismissWarning,
    refreshSession,
  };
} 