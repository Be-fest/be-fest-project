import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pagamento Pendente',
};

function PagamentoPendentePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">
          Pagamento Pendente
        </h1>
        <p className="text-gray-600">
          Seu pagamento está sendo processado. Por favor, aguarde a confirmação.
        </p>
      </div>
    </main>
  );
}

export { PagamentoPendentePage as default };
