'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function DebugAuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Verificando autenticação...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Session:', session);
        console.log('Error:', error);
        
        setSessionInfo({
          session: session ? {
            user: session.user?.email,
            expires_at: session.expires_at,
            access_token: session.access_token ? 'presente' : 'ausente'
          } : null,
          error: error?.message
        });
        
        setUser(session?.user || null);
        
      } catch (error) {
        console.error('Erro:', error);
        setSessionInfo({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Autenticação</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Status do Usuário</h2>
            <div className="space-y-2">
              <p><strong>Autenticado:</strong> {user ? 'Sim' : 'Não'}</p>
              {user && (
                <>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Informações da Sessão</h2>
            <pre className="text-sm bg-white p-4 rounded border overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
          
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            Ir para Login
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Ir para Home
          </button>
        </div>
      </div>
    </div>
  );
} 