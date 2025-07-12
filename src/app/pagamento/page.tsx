'use client';

import { Suspense } from 'react';
import { PaymentPageContent } from './PaymentPageContent';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';

function PaymentPageLoading() {
  return (
    <ClientAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ClientLayout>
    </ClientAuthGuard>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentPageLoading />}>
      <PaymentPageContent />
    </Suspense>
  );
} 