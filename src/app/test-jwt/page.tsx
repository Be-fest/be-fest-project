'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGlobalToast } from '@/contexts/GlobalToastContext';

export default function TestJWTPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { user, userData } = useAuth();
  const toast = useGlobalToast();
  const supabase = createClient();

  const testJWTExpired = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Simular uma consulta que pode gerar erro de JWT expirado
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id || 'fake-id')
        .single();

      if (error) {
        setResult(`Erro: ${error.message} (Code: ${error.code})`);
        
        // Verificar se é erro de JWT expirado
        if (error.code === 'PGRST301' || error.message.includes('JWT expired')) {
          toast.warning('JWT Expirado Detectado', 'O sistema deve lidar com isso automaticamente.');
        }
      } else {
        setResult('Consulta bem-sucedida: ' + JSON.stringify(data, null, 2));
      }
    } catch (error: any) {
      setResult(`Erro catch: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testToast = () => {
    toast.success('Teste de Toast', 'Este é um toast de sucesso!');
  };

  const testWarningToast = () => {
    toast.warning('Teste de Aviso', 'Este é um toast de aviso!');
  };

  const testErrorToast = () => {
    toast.error('Teste de Erro', 'Este é um toast de erro!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Teste de JWT Expirado
          </h1>

          {/* Informações do usuário */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
            <p><strong>Logado:</strong> {user ? 'Sim' : 'Não'}</p>
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Role:</strong> {userData?.role || 'Carregando...'}</p>
              </>
            )}
          </div>

          {/* Botões de teste */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={testJWTExpired}
                disabled={loading || !user}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testando...' : 'Testar Consulta (Pode gerar JWT expirado)'}
              </button>

              <button
                onClick={testToast}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Testar Toast Sucesso
              </button>

              <button
                onClick={testWarningToast}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Testar Toast Aviso
              </button>

              <button
                onClick={testErrorToast}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Testar Toast Erro
              </button>
            </div>

            {!user && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  Você precisa estar logado para testar a funcionalidade de JWT expirado.
                </p>
                <a 
                  href="/auth/login" 
                  className="text-yellow-600 hover:text-yellow-800 underline"
                >
                  Fazer login
                </a>
              </div>
            )}
          </div>

          {/* Resultado */}
          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {/* Instruções */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Como testar:</h3>
            <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
              <li>Faça login na aplicação</li>
              <li>Aguarde até que o JWT expire (1 hora) ou force a expiração</li>
              <li>Clique em "Testar Consulta" para simular uma operação que pode gerar erro de JWT expirado</li>
              <li>Observe se o toast de aviso aparece e se você é redirecionado para o login</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 