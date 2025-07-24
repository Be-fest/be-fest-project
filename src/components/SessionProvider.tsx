'use client';

import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { SessionExpiryModal } from './SessionExpiryModal';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const sessionHandledRef = useRef(false);

  const handleSessionExpired = useCallback(() => {
    // Prevenir múltiplos redirecionamentos
    if (sessionHandledRef.current) {
      return;
    }
    
    sessionHandledRef.current = true;
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

  // Usando o novo sistema de autenticação otimizado
  const optimizedAuth = useOptimizedAuth();
  
  // Simplificado - sem gerenciamento de sessão complexo por enquanto
  const showWarning = false;
  const minutesLeft = 0;
  const extendSession = () => Promise.resolve(true);
  const dismissWarning = () => {};

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