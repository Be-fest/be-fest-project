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
  const { user, userData, loading, isAuthenticated } = useOptimizedAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push(`${redirectTo}?redirectTo=${window.location.pathname}`);
      return;
    }

    if (requiredRole && userData?.role !== requiredRole) {
      router.push('/acesso-negado');
      return;
    }
  }, [isAuthenticated, userData?.role, requiredRole, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && userData?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
} 