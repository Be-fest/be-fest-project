'use client';

import { useAuth } from '@/hooks/useAuth';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';

export default function TestAuthPage() {
  const { user, loading } = useAuth();
  const optimizedAuth = useOptimizedAuth();

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Autenticação</h1>
      <div className="space-y-4">
        <div>
          <strong>useAuth:</strong> {user ? `Logado como ${user.email}` : 'Não logado'}
        </div>
        <div>
          <strong>useOptimizedAuth:</strong> {optimizedAuth.isAuthenticated ? `Logado - ${optimizedAuth.userDisplayName}` : 'Não logado'}
        </div>
      </div>
    </div>
  );
}