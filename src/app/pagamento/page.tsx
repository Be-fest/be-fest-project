'use client';

import { useState } from 'react';
import { PaymentForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();

  // Aqui você pode buscar os dados reais da festa
  const mockServices = [
    { name: 'Almoço/Jantar (Linha Gourmet)', provider: 'Barreto\'s Buffet' },
    { name: 'Open Bar (Linha Bebidas)', provider: 'Barreto\'s Buffet' },
    { name: 'Aluguel de Materiais (Organização)', provider: 'Barreto\'s Buffet' },
  ];

  const handlePayment = async () => {
    try {
      // Aqui você implementa a lógica de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulando processamento
      router.push('/minhas-festas');
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handlePaymentSuccess = () => {
    // Redirecionar para a página da festa
    router.push(`/minhas-festas/${eventId}`);
  };

  return (
    <AuthLayout>
      <div className="relative w-full px-4 sm:px-0">
        <div className="w-full max-w-sm mx-auto sm:max-w-md">
          <PaymentForm
            services={mockServices}
            totalValue={7000}
            onSubmit={handlePayment}
          />
        </div>
      </div>
    </AuthLayout>
  );
} 