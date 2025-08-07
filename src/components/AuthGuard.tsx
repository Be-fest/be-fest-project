'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthErrorFallback } from './ui/AuthErrorFallback';
import { ClientOnly } from './ClientOnly';
import LoadingSpinner from './LoadingSpinner';
import { getTimeout, shouldSilenceErrors } from '@/config/production';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export function AuthGuard({ children, requiredRole, redirectTo = '/auth/login' }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        if (!shouldSilenceErrors()) {
          console.error('Erro ao verificar sessão:', error);
        }
        setError('Erro ao verificar autenticação');
        setLoading(false);
        return;
      }

      if (!session) {
        router.push(redirectTo);
        return;
      }

      setUser(session.user);

      // Buscar dados do usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        if (!shouldSilenceErrors()) {
          console.error('Erro ao buscar dados do usuário:', userError);
        }
        
        // Se não encontrar o usuário na tabela, pode ser que ainda não foi criado
        // Vamos assumir que é um cliente por padrão
        setUserRole('client');
      } else {
        setUserRole(userData.role);
      }

      // Verificar se o usuário tem o papel necessário
      if (requiredRole && userData?.role !== requiredRole) {
        if (!shouldSilenceErrors()) {
          console.log('Usuário não tem o papel necessário:', {
            required: requiredRole,
            actual: userData?.role
          });
        }
        router.push('/acesso-negado');
        return;
      }

      setLoading(false);
    } catch (error) {
      if (!shouldSilenceErrors()) {
        console.error('Erro inesperado no AuthGuard:', error);
      }
      setError('Erro inesperado na verificação de autenticação');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Só executar no cliente
    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, [requiredRole]);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Timeout na verificação de autenticação');
      }
    }, getTimeout('AUTH_TIMEOUT')); // Usar timeout de produção

    return () => clearTimeout(timeout);
  }, [loading]);

  const handleRetry = async () => {
    await checkAuth();
  };

  const handleLogout = () => {
    router.push(redirectTo);
  };

  const handleLoadingTimeout = () => {
    setLoading(false);
    setError('Timeout na verificação de autenticação. Tente novamente.');
  };

  if (loading) {
    return (
      <LoadingSpinner 
        message="Verificando autenticação..." 
        timeout={getTimeout('AUTH_TIMEOUT')}
        onTimeout={handleLoadingTimeout}
      />
    );
  }

  if (error) {
    return (
      <ClientOnly fallback={<LoadingSpinner message="Carregando..." />}>
        <div className="container mx-auto px-4 py-8">
          <AuthErrorFallback 
            error={error} 
            onRetry={handleRetry}
            onLogout={handleLogout}
          />
        </div>
      </ClientOnly>
    );
  }

  if (!user) {
    return null; // Redirecionamento em andamento
  }

  return (
    <ClientOnly fallback={<LoadingSpinner message="Carregando..." />}>
      {children}
    </ClientOnly>
  );
}