'use client';

import { useState } from 'react';
import { Button } from './Button';
import { useAuth } from '@/hooks/useAuth';

interface AuthErrorFallbackProps {
  error: string;
  onRetry?: () => void;
  onLogout?: () => void;
}

export function AuthErrorFallback({ error, onRetry, onLogout }: AuthErrorFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const { signOut } = useAuth();

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getErrorMessage = (error: string) => {
    if (error.includes('conexão') || error.includes('network')) {
      return 'Problema de conexão detectado. Verifique sua internet e tente novamente.';
    }
    if (error.includes('timeout') || error.includes('tempo limite')) {
      return 'A requisição demorou muito para responder. Tente novamente.';
    }
    if (error.includes('permissão') || error.includes('permission')) {
      return 'Você não tem permissão para acessar estes dados. Tente fazer login novamente.';
    }
    if (error.includes('sessão') || error.includes('session')) {
      return 'Sua sessão expirou. Faça login novamente para continuar.';
    }
    return error;
  };

  const getErrorIcon = (error: string) => {
    if (error.includes('conexão') || error.includes('network')) {
      return '🌐';
    }
    if (error.includes('timeout') || error.includes('tempo limite')) {
      return '⏰';
    }
    if (error.includes('permissão') || error.includes('permission')) {
      return '🔒';
    }
    if (error.includes('sessão') || error.includes('session')) {
      return '🔑';
    }
    return '⚠️';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="text-4xl mb-4">{getErrorIcon(error)}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erro de Autenticação
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {getErrorMessage(error)}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isRetrying ? 'Tentando...' : 'Tentar Novamente'}
            </Button>
          )}
          
          <Button
            onClick={handleLogout}
            variant="secondary"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Fazer Logout
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Se o problema persistir, tente limpar o cache do navegador ou entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
} 