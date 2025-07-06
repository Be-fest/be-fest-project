'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSessionManager } from '@/hooks/useSessionManager';
import { AuthGuard } from '@/components/AuthGuard';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function TestAuthPage() {
  const { user, userData, loading, error, signOut, isAuthenticated } = useAuth();
  const { showWarning, minutesLeft, extendSession, isSessionExpiring } = useSessionManager({
    warningMinutes: 1, // Para teste, avisar com 1 minuto
    autoRefresh: false, // Desabilitar auto-refresh para teste
  });
  const [testResult, setTestResult] = useState<string>('');
  const supabase = createClient();

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, role, full_name')
        .limit(1);

      if (error) {
        setTestResult(`Erro na conexão: ${error.message}`);
      } else {
        setTestResult(`Conexão OK! Dados: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setTestResult(`Erro: ${error}`);
    }
  };

  const testAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setTestResult(`Erro de auth: ${error.message}`);
      } else if (session) {
        const expiresAt = new Date(session.expires_at! * 1000);
        const now = new Date();
        const minutesLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
        
        setTestResult(`Sessão OK! User ID: ${session.user.id}. Expira em ${minutesLeft} minutos (${expiresAt.toLocaleTimeString()})`);
      } else {
        setTestResult('Nenhuma sessão encontrada');
      }
    } catch (error) {
      setTestResult(`Erro: ${error}`);
    }
  };

  const testSessionRefresh = async () => {
    try {
      const success = await extendSession();
      setTestResult(success ? 'Sessão renovada com sucesso!' : 'Falha ao renovar sessão');
    } catch (error) {
      setTestResult(`Erro ao renovar: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste de Autenticação</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status da Autenticação */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Status da Autenticação</h2>
            <div className="space-y-2">
              <p><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sim' : '❌ Não'}</p>
              <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
              <p><strong>Erro:</strong> {error || 'Nenhum'}</p>
              <p><strong>Sessão expirando:</strong> {isSessionExpiring ? '⚠️ Sim' : 'Não'}</p>
              <p><strong>Aviso ativo:</strong> {showWarning ? '🔔 Sim' : 'Não'}</p>
              <p><strong>Minutos restantes:</strong> {minutesLeft !== null ? `${minutesLeft} min` : 'N/A'}</p>
            </div>
          </div>

          {/* Dados do Usuário */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Dados do Usuário</h2>
            {user ? (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nome:</strong> {userData?.full_name || 'N/A'}</p>
                <p><strong>Role:</strong> {userData?.role || 'N/A'}</p>
                <p><strong>Organização:</strong> {userData?.organization_name || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum usuário logado</p>
            )}
          </div>

          {/* Testes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Testes</h2>
            <div className="space-y-3">
              <button
                onClick={testAuth}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Testar Autenticação
              </button>
              <button
                onClick={testDatabaseConnection}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Testar Conexão DB
              </button>
              <button
                onClick={testSessionRefresh}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Renovar Sessão
              </button>
              <button
                onClick={signOut}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Fazer Logout
              </button>
            </div>
          </div>

          {/* Resultado dos Testes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Resultado dos Testes</h2>
            <div className="bg-gray-100 p-4 rounded text-sm font-mono">
              {testResult || 'Execute um teste para ver os resultados'}
            </div>
          </div>
        </div>

        {/* Área Protegida */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Área Protegida (AuthGuard)</h2>
          <AuthGuard requiredRole="client">
            <div className="bg-green-100 border border-green-400 p-4 rounded">
              <p className="text-green-700">
                ✅ Esta área está protegida e só aparece para clientes autenticados!
              </p>
            </div>
          </AuthGuard>
        </div>
      </div>
    </div>
  );
} 