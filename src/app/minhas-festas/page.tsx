'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MinhasFestasPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a aba de Minhas Festas no perfil
    router.replace('/perfil?tab=minhas-festas');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#F71875] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para suas festas...</p>
      </div>
    </div>
  );
} 