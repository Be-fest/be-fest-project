'use client';

import { LoginForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getSessionMessage = () => {
    switch (reason) {
      case 'session_expired':
        return {
          type: 'warning',
          message: 'Sua sessão expirou. Por favor, faça login novamente para continuar.'
        };
      case 'unauthorized':
        return {
          type: 'error',
          message: 'Acesso negado. Você precisa estar logado para acessar esta página.'
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
            <div className={`mb-6 p-4 rounded-lg ${
              sessionMessage.type === 'warning' 
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{sessionMessage.message}</p>
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
