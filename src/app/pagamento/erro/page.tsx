'use client';

export default function PagamentoErroPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Erro no Pagamento
        </h1>
        <p className="text-gray-600">
          Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.
        </p>
      </div>
    </main>
  );
}
