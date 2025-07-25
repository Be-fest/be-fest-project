'use client';

import { useParams } from 'next/navigation';

export default function MinhasFestasDetalhePage() {
  const params = useParams();
  const id = params?.id;

  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <h1 className="text-3xl font-bold text-[#520029]">
        Detalhes da festa #{id}
      </h1>
    </main>
  );
}
