'use client';

import { useSessionManager } from '@/hooks/useSessionManager';
import { SessionExpiryModal } from './SessionExpiryModal';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSessionExpired = useCallback(() => {
    console.log('Sessão expirada - redirecionando para login');
    // Adicionar parâmetro para mostrar mensagem específica
    router.push('/auth/login?reason=session_expired');
  }, [router]);

  const handleSessionWarning = useCallback((minutesLeft: number) => {
    console.log(`Aviso: sessão expira em ${minutesLeft} minutos`);
    // Aqui você pode adicionar notificações toast se quiser
  }, []);

  const handleLogout = useCallback(async () => {
    handleSessionExpired();
  }, [handleSessionExpired]);

  const {
    showWarning,
    minutesLeft,
    extendSession,
    dismissWarning,
  } = useSessionManager({
    warningMinutes: 5, // Avisar 5 minutos antes
    autoRefresh: true, // Renovar automaticamente
    onSessionExpired: handleSessionExpired,
    onSessionWarning: handleSessionWarning,
  });

  return (
    <>
      {children}
      
      {/* Modal de aviso de expiração - só mostra se o usuário estiver autenticado */}
      {isAuthenticated && (
        <SessionExpiryModal
          isOpen={showWarning}
          minutesLeft={minutesLeft}
          onExtendSession={extendSession}
          onLogout={handleLogout}
          onDismiss={dismissWarning}
        />
      )}
    </>
  );
} 