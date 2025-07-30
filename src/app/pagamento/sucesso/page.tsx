import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pagamento Confirmado',
};

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Pagamento Confirmado!
        </h1>
        <p className="text-gray-600">
          Seu pagamento foi processado com sucesso. Obrigado pela confiança!
        </p>
      </div>
    </main>
  );
}
