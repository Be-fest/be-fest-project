'use client';

import { LoginForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Verificar se há mensagem de sessão expirada no localStorage
    const expired = localStorage.getItem('sessionExpired');
    if (expired === 'true') {
      setSessionExpired(true);
      // Limpar o localStorage após mostrar a mensagem
      localStorage.removeItem('sessionExpired');
    }
  }, []);

  const getSessionMessage = () => {
    // Priorizar mensagem de sessão expirada do localStorage
    if (sessionExpired) {
      return {
        type: 'warning',
        message: 'Sua sessão expirou. Por favor, faça login novamente para continuar.',
        icon: '⚠️'
      };
    }

    switch (reason) {
      case 'session_expired':
        return {
          type: 'warning',
          message: 'Sua sessão expirou. Por favor, faça login novamente para continuar.',
          icon: '⚠️'
        };
      case 'unauthorized':
        return {
          type: 'error',
          message: 'Acesso negado. Você precisa estar logado para acessar esta página.',
          icon: '🚫'
        };
      default:
        return null;
    }
  };

  const sessionMessage = getSessionMessage();

  return (
    <AuthLayout>
      <div className="relative w-full px-4 sm:px-0">
        <div className="w-full max-w-sm mx-auto sm:max-w-md">
          {sessionMessage && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              sessionMessage.type === 'warning' 
                ? 'bg-yellow-50 border-yellow-400 text-yellow-800' 
                : 'bg-red-50 border-red-400 text-red-800'
            }`}>
              <div className="flex items-center">
                <span className="text-lg mr-2">{sessionMessage.icon}</span>
                <div>
                  <p className="text-sm font-medium">
                    {sessionMessage.type === 'warning' ? 'Sessão Expirada' : 'Acesso Negado'}
                  </p>
                  <p className="text-sm mt-1">{sessionMessage.message}</p>
                </div>
              </div>
            </div>
          )}
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="relative w-full px-4 sm:px-0">
          <div className="w-full max-w-sm mx-auto sm:max-w-md">
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </AuthLayout>
    }>
      <LoginContent />
    </Suspense>
  );
}
