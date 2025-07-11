'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DebugCookiesPage() {
  const router = useRouter();

  useEffect(() => {
    // Limpar todos os cookies relacionados ao Supabase
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'sb-provider-token',
      'sb-user',
      'supabase-auth-token',
      'supabase.auth.token'
    ];

    cookiesToClear.forEach(cookieName => {
      // Limpar com diferentes caminhos e domínios
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });

    // Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Aguardar um pouco e redirecionar
    setTimeout(() => {
      router.push('/auth/login?reason=cookies_cleared');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#F71875] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-[#520029] mb-2">Limpando cookies...</h1>
        <p className="text-gray-600">Aguarde enquanto limpamos os dados corrompidos.</p>
      </div>
    </div>
  );
} 