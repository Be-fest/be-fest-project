'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdBlock, MdArrowBack, MdDashboard } from 'react-icons/md';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

export default function AcessoNegadoPage() {
  const router = useRouter();
  const { userData } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Redirecionar automaticamente após 5 segundos
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/dashboard/prestador');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoToDashboard = () => {
    router.push('/dashboard/prestador');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Ícone */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MdBlock className="text-red-600 text-4xl" />
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Acesso Restrito
            </h1>

            {/* Mensagem */}
            <div className="text-gray-600 mb-8 space-y-3">
              <p className="text-lg">
                Olá, <strong>{userData?.full_name || userData?.organization_name}</strong>!
              </p>
              <p>
                Esta área é exclusiva para <strong>clientes</strong> que desejam organizar festas.
              </p>
              <p>
                Como <strong>prestador de serviços</strong>, você tem acesso ao seu dashboard específico 
                onde pode gerenciar seus serviços, pedidos e perfil.
              </p>
            </div>

            {/* Contador */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600">
                Redirecionando para seu dashboard em{' '}
                <span className="font-bold text-red-600">{countdown}</span> segundos...
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={handleGoToDashboard}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] text-white px-6 py-3 rounded-lg hover:from-[#8B0A9E] hover:to-[#520029] transition-all font-semibold"
              >
                <MdDashboard />
                Ir para Dashboard
              </button>
              
              <button
                onClick={handleGoToHome}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all font-semibold"
              >
                <MdArrowBack />
                Voltar ao Início
              </button>
            </div>

            {/* Informação adicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Você ainda pode navegar pela home e página de serviços 
                para ver como os clientes visualizam sua oferta!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 