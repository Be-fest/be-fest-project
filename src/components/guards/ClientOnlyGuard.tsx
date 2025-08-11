'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ClientOnlyGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ClientOnlyGuard({ 
  children, 
  redirectTo = '/dashboard/prestador' 
}: ClientOnlyGuardProps) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Aguardar carregamento dos dados do usuário
    if (loading) return;

    // Se é prestador, redirecionar imediatamente
    if (userData?.role === 'provider') {
      router.replace(redirectTo);
      return;
    }
  }, [userData, loading, router, redirectTo]);

  // Se ainda está carregando, não renderizar nada
  if (loading) {
    return null;
  }

  // Se é prestador, não renderizar o conteúdo
  if (userData?.role === 'provider') {
    return null;
  }

  // Se não é prestador, renderizar o conteúdo
  return <>{children}</>;
}