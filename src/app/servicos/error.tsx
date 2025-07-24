'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MdArrowBack, MdRefresh } from 'react-icons/md';

export default function ServicosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#520029] mb-4">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-600 mb-8">
            Não foi possível carregar os serviços. Por favor, tente novamente.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B0A9E] transition-colors font-medium"
            >
              <MdRefresh className="text-xl" />
              Tentar Novamente
            </button>
            <Link
              href="/perfil"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#A502CA] text-[#A502CA] rounded-lg hover:bg-[#A502CA] hover:text-white transition-colors font-medium"
            >
              <MdArrowBack className="text-xl" />
              Voltar para Minhas Festas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 