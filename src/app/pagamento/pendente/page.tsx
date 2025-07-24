'use client';

import { ClientLayout } from '@/components/client/ClientLayout';

export default function PaymentPendingPage() {
  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-yellow-700 mb-2">
            Pagamento Pendente
          </h1>
          <p className="text-yellow-600 mb-4">
            Seu pagamento está sendo processado. Aguarde a confirmação.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}