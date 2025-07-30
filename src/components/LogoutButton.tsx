'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { MdExitToApp } from 'react-icons/md';
import { useState } from 'react';
import { performLogout } from '@/lib/logout';

export default function LogoutButton() {
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevenir cliques múltiplos
    
    console.log('🔴 Iniciando logout do LogoutButton...');
    setIsLoggingOut(true);
    
    try {
      // Usar a função performLogout melhorada
      await performLogout('logout_button');
      
      // Se chegou até aqui sem redirecionar, forçar redirecionamento manual
      console.warn('⚠️ Logout concluído mas ainda na página, forçando redirecionamento...');
      window.location.href = '/auth/login?reason=manual_redirect';
      
    } catch (error) {
      console.error('❌ Erro no LogoutButton:', error);
      
      // Em caso de erro, forçar redirecionamento
      window.location.href = '/auth/login?reason=error_redirect';
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center space-x-4 p-3 text-red-600 hover:bg-red-50 transition-all duration-200 w-full rounded-xl group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
        {isLoggingOut ? (
          <MdExitToApp className="text-xl animate-pulse" />
        ) : (
          <MdExitToApp className="text-xl" />
        )}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </div>
        <div className="text-xs text-red-400">
          Fazer logout da conta
        </div>
      </div>
    </Button>
  );
}