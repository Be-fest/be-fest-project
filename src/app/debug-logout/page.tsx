'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MdWarning, MdExitToApp, MdBuild, MdRefresh } from 'react-icons/md';

export default function DebugLogoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('🔧 Página de debug do logout carregada');
    addLog('⚠️ Esta página deve ser usada apenas se o logout normal falhar');
  }, []);

  const executeStep = async (stepNumber: number) => {
    setStep(stepNumber);
    
    try {
      switch (stepNumber) {
        case 1:
          addLog('🔄 Passo 1: Fazendo logout no Supabase...');
          const supabase = createClient();
          const { error } = await supabase.auth.signOut();
          if (error) {
            addLog(`❌ Erro no logout do Supabase: ${error.message}`);
          } else {
            addLog('✅ Logout do Supabase realizado com sucesso');
          }
          break;
          
        case 2:
          addLog('🔄 Passo 2: Limpando localStorage...');
          if (typeof window !== 'undefined') {
            const itemsToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth'))) {
                itemsToRemove.push(key);
              }
            }
            
            itemsToRemove.forEach(key => {
              localStorage.removeItem(key);
              addLog(`🗑️ Removido: ${key}`);
            });
            
            addLog(`✅ LocalStorage limpo (${itemsToRemove.length} itens removidos)`);
          }
          break;
          
        case 3:
          addLog('🔄 Passo 3: Limpando cookies...');
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            let cookiesCleared = 0;
            
            cookies.forEach(cookie => {
              const eqPos = cookie.indexOf('=');
              const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
              
              if (name.includes('sb-') || name.includes('auth') || name.includes('supabase')) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                cookiesCleared++;
                addLog(`🍪 Cookie removido: ${name}`);
              }
            });
            
            addLog(`✅ Cookies limpos (${cookiesCleared} cookies removidos)`);
          }
          break;
          
        case 4:
          addLog('🔄 Passo 4: Redirecionando...');
          
          // Múltiplos métodos de redirecionamento
          setTimeout(() => {
            addLog('🔄 Tentativa 1: window.location.replace');
            window.location.replace('/auth/login?reason=debug_logout');
          }, 1000);
          
          setTimeout(() => {
            addLog('🔄 Tentativa 2: window.location.href');
            window.location.href = '/auth/login?reason=debug_logout_2';
          }, 3000);
          
          setTimeout(() => {
            addLog('🔄 Tentativa 3: router.push');
            router.push('/auth/login?reason=debug_logout_3');
          }, 5000);
          
          setTimeout(() => {
            addLog('🔄 Último recurso: window.location.reload');
            window.location.reload();
          }, 7000);
          
          break;
      }
    } catch (error) {
      addLog(`❌ Erro no passo ${stepNumber}: ${error}`);
    }
  };

  const executeFullLogout = async () => {
    addLog('🚨 Executando logout completo em sequência...');
    setStep(0);
    
    await executeStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await executeStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await executeStep(3);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await executeStep(4);
  };

  const emergencyLogout = () => {
    addLog('🚨 LOGOUT DE EMERGÊNCIA - Limpando tudo e redirecionando imediatamente!');
    
    try {
      // Limpar tudo rapidamente
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpar cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Redirecionamento forçado
      window.location.replace('/auth/login?reason=emergency');
    } catch (error) {
      addLog(`❌ Erro no logout de emergência: ${error}`);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6FB] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MdBuild className="text-2xl text-orange-500" />
            <h1 className="text-2xl font-bold text-[#520029]">Debug do Logout</h1>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <MdWarning className="text-lg" />
              <span className="font-medium">Atenção:</span>
            </div>
            <p className="text-yellow-700 text-sm">
              Esta página deve ser usada apenas se o logout normal não estiver funcionando. 
              Ela força a limpeza de dados e redirecionamento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => executeStep(1)}
              disabled={step === 1}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-blue-50 disabled:border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  step === 1 ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  1
                </div>
                <div className="text-left">
                  <div className="font-medium">Logout Supabase</div>
                  <div className="text-sm text-gray-500">Encerrar sessão no backend</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => executeStep(2)}
              disabled={step === 2}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-blue-50 disabled:border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  step === 2 ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  2
                </div>
                <div className="text-left">
                  <div className="font-medium">Limpar localStorage</div>
                  <div className="text-sm text-gray-500">Remover dados locais</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => executeStep(3)}
              disabled={step === 3}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-blue-50 disabled:border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  step === 3 ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  3
                </div>
                <div className="text-left">
                  <div className="font-medium">Limpar Cookies</div>
                  <div className="text-sm text-gray-500">Remover cookies de autenticação</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => executeStep(4)}
              disabled={step === 4}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-blue-50 disabled:border-blue-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  step === 4 ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  4
                </div>
                <div className="text-left">
                  <div className="font-medium">Redirecionar</div>
                  <div className="text-sm text-gray-500">Ir para página de login</div>
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={executeFullLogout}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MdExitToApp />
              Executar Logout Completo
            </button>
            
            <button
              onClick={emergencyLogout}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MdWarning />
              Logout de Emergência
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#520029] mb-4">Logs do Processo</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Nenhum log ainda...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 