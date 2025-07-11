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
      case 'cookie_error':
        return {
          type: 'warning',
          message: 'Houve um problema com os dados de autenticação. Dados limpos automaticamente.',
          icon: '🔧'
        };
      case 'cookie_refresh':
        return {
          type: 'info',
          message: 'Dados de autenticação atualizados. Faça login novamente.',
          icon: '🔄'
        };
      case 'cookies_cleared':
        return {
          type: 'success',
          message: 'Cookies limpos com sucesso. Você pode fazer login novamente.',
          icon: '✅'
        };
      case 'general_error':
        return {
          type: 'error',
          message: 'Ocorreu um erro técnico. Tente fazer login novamente.',
          icon: '⚠️'
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
                : sessionMessage.type === 'error'
                ? 'bg-red-50 border-red-400 text-red-800'
                : sessionMessage.type === 'info'
                ? 'bg-blue-50 border-blue-400 text-blue-800'
                : sessionMessage.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-gray-50 border-gray-400 text-gray-800'
            }`}>
              <div className="flex items-center">
                <span className="text-lg mr-2">{sessionMessage.icon}</span>
                <div>
                  <p className="text-sm font-medium">
                    {sessionMessage.type === 'warning' ? 'Atenção' : 
                     sessionMessage.type === 'error' ? 'Erro' :
                     sessionMessage.type === 'info' ? 'Informação' :
                     sessionMessage.type === 'success' ? 'Sucesso' : 'Aviso'}
                  </p>
                  <p className="text-sm mt-1">{sessionMessage.message}</p>
                </div>
              </div>
            </div>
          )}
          <LoginForm />
          
          {/* Link para debug de cookies */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Problemas para fazer login?{' '}
              <a 
                href="/debug-cookies" 
                className="text-[#F71875] hover:text-[#E6006F] underline"
              >
                Limpar dados corrompidos
              </a>
            </p>
          </div>
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
