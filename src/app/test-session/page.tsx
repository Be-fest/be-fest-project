'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function TestSessionPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const checkSession = async () => {
      try {
        // Verificar sessão
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔍 [TEST] Sessão encontrada:', !!currentSession);
        console.log('🔍 [TEST] Erro de sessão:', sessionError);
        console.log('🔍 [TEST] Dados da sessão:', currentSession);

        if (sessionError) {
          setError(`Erro de sessão: ${sessionError.message}`);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user || null);

        // Se há sessão, buscar dados do usuário
        if (currentSession?.user) {
          const { data: userDataResult, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          console.log('🔍 [TEST] Dados do usuário:', userDataResult);
          console.log('🔍 [TEST] Erro do usuário:', userError);

          if (userError) {
            setError(`Erro ao buscar usuário: ${userError.message}`);
          } else {
            setUserData(userDataResult);
          }
        }

      } catch (err) {
        console.error('🔍 [TEST] Erro geral:', err);
        setError(`Erro geral: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Teste de Sessão</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Erro:</strong> {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Status da Sessão */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Status da Sessão</h2>
              <div className="space-y-2">
                <p><strong>Sessão ativa:</strong> {session ? '✅ Sim' : '❌ Não'}</p>
                <p><strong>User ID:</strong> {user?.id || 'Nenhum'}</p>
                <p><strong>Email:</strong> {user?.email || 'Nenhum'}</p>
                <p><strong>Provider:</strong> {user?.app_metadata?.provider || 'Nenhum'}</p>
              </div>
            </div>

            {/* Dados do Usuário */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Dados do Usuário (Tabela users)</h2>
              {userData ? (
                <div className="space-y-2">
                  <p><strong>Nome:</strong> {userData.full_name || 'Não informado'}</p>
                  <p><strong>Role:</strong> {userData.role || 'Não informado'}</p>
                  <p><strong>Phone:</strong> {userData.phone || 'Não informado'}</p>
                  <p><strong>Created At:</strong> {userData.created_at || 'Não informado'}</p>
                </div>
              ) : (
                <p className="text-gray-500">Nenhum dado encontrado ou erro ao carregar.</p>
              )}
            </div>

            {/* Cookies */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Cookies</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Todos os cookies:</strong></p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {document.cookie || 'Nenhum cookie encontrado'}
                </pre>
              </div>
            </div>

            {/* Teste de Rotas */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Testar Rotas</h2>
              <div className="space-y-2">
                <a href="/perfil" className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Testar /perfil
                </a>
                <a href="/minhas-festas" className="block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Testar /minhas-festas
                </a>
                <a href="/dashboard" className="block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  Ir para o Dashboard
                </a>
              </div>
            </div>

            {/* Sessão Completa (Debug) */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Sessão Completa (Debug)</h2>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 