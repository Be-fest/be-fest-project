'use client';

import { MdExitToApp } from 'react-icons/md';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useState } from 'react';
import { performLogout, emergencyLogout } from '@/lib/logout';

export default function LogoutButton() {
  const { userData } = useOptimizedAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevenir cliques múltiplos
    
    console.log('🔴 Iniciando logout do LogoutButton...');
    setIsLoggingOut(true);
    
    try {
      // Timeout de segurança - se não redirecionar em 10 segundos, usar logout de emergência
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Timeout de logout atingido, executando logout de emergência...');
        emergencyLogout('timeout');
      }, 10000);
      
      await performLogout('logout_button');
      
      // Se chegou até aqui sem redirecionar, limpar timeout e tentar redirecionamento manual
      clearTimeout(timeoutId);
      console.warn('⚠️ Logout concluído mas ainda na página, forçando redirecionamento...');
      
      setTimeout(() => {
        window.location.href = '/auth/login?reason=manual_redirect';
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro no LogoutButton:', error);
      
      // Em caso de erro, forçar redirecionamento
      setTimeout(() => {
        window.location.href = '/auth/login?reason=error_redirect';
      }, 1000);
    } finally {
      // O setIsLoggingOut(false) pode não ser executado devido ao redirecionamento
      // mas mantemos por segurança
      setTimeout(() => setIsLoggingOut(false), 100);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center space-x-4 p-3 text-red-600 hover:bg-red-50 transition-all duration-200 w-full rounded-xl group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
        {isLoggingOut ? (
          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <MdExitToApp className="text-xl" />
        )}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </div>
        <div className="text-xs text-red-400">
          {userData?.full_name ? `${userData.full_name}` : 'Fazer logout da conta'}
        </div>
      </div>
    </button>
  );
} 