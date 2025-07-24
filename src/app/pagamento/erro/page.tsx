'use client';

import { ClientLayout } from '@/components/client/ClientLayout';

export default function PaymentErrorPage() {
  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            Erro no Pagamento
          </h1>
          <p className="text-red-600 mb-4">
            Ocorreu um erro ao processar seu pagamento. Tente novamente.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </ClientLayout>
  );
}