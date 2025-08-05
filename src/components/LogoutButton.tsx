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
      // Abordagem mais direta - limpar tudo imediatamente
      console.log('🗑️ Limpando localStorage e sessionStorage...');
      
      // Limpar localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Limpar cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }
      
      // Fazer logout no Supabase de forma assíncrona (não esperar)
      const supabase = (await import('@/lib/supabase/client')).createClient();
      supabase.auth.signOut().catch(error => {
        console.warn('⚠️ Erro no signOut do Supabase (ignorado):', error);
      });
      
      // Redirecionamento imediato
      console.log('🔄 Redirecionando imediatamente...');
      window.location.replace('/auth/login?reason=logout_button');
      
    } catch (error) {
      console.error('❌ Erro no LogoutButton:', error);
      
      // Em caso de erro, forçar redirecionamento de qualquer forma
      window.location.replace('/auth/login?reason=error_redirect');
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