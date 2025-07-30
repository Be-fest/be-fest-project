'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

interface FastAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export default function FastAuthGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/auth/login' 
}: FastAuthGuardProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const toast = useToastGlobal();

  // Computed properties based on user and userData
  const isAuthenticated = !!user && !!userData;
  const isClient = userData?.role === 'client';
  const isProvider = userData?.role === 'provider';
  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast.error('Acesso Negado', 'Você precisa fazer login para acessar esta página');
        router.push(redirectTo);
        return;
      }

      if (requiredRole) {
        const hasRequiredRole = 
          (requiredRole === 'client' && isClient) ||
          (requiredRole === 'provider' && isProvider) ||
          (requiredRole === 'admin' && isAdmin);

        if (!hasRequiredRole) {
          toast.error('Acesso Negado', 'Você não tem permissão para acessar esta página');
          router.push('/acesso-negado');
          return;
        }
      }
    }
  }, [loading, isAuthenticated, isClient, isProvider, isAdmin, requiredRole, router, redirectTo, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0080] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole) {
    const hasRequiredRole = 
      (requiredRole === 'client' && isClient) ||
      (requiredRole === 'provider' && isProvider) ||
      (requiredRole === 'admin' && isAdmin);

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
} 