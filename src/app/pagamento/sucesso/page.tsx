'use client';

import { ClientLayout } from '@/components/client/ClientLayout';

export default function PaymentSuccessPage() {
  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Pagamento Realizado com Sucesso!
          </h1>
          <p className="text-green-600 mb-4">
            Seu pagamento foi processado com sucesso. Obrigado!
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}