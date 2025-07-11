'use client';

import { MdExitToApp } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { performLogout } from '@/lib/logout';

export default function LogoutButton() {
  const { userData } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevenir cliques múltiplos
    
    setIsLoggingOut(true);
    
    try {
      await performLogout('logout_button');
    } catch (error) {
      console.error('Erro no LogoutButton:', error);
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