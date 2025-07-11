'use client';

import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface FastAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'provider' | 'admin';
  redirectTo?: string;
}

export function FastAuthGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/auth/login' 
}: FastAuthGuardProps) {
  const { user, userRole, loading, isAuthenticated } = useOptimizedAuth(requiredRole);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push(`${redirectTo}?redirectTo=${window.location.pathname}`);
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      router.push('/acesso-negado');
      return;
    }
  }, [isAuthenticated, userRole, requiredRole, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && userRole !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
} 