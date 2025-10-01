import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { ProviderHero } from '@/components/provider-page/ProviderHero';
import { ProviderBenefits } from '@/components/provider-page/ProviderBenefits';
import { ProviderHowItWorks } from '@/components/provider-page/ProviderHowItWorks';
import { ProviderFAQ } from '@/components/provider-page/ProviderFAQ';
import { ProviderCTA } from '@/components/provider-page/ProviderCTA';
import { Footer } from '@/components/Footer';

function HeaderFallback() {
  return <div className="h-16 bg-white shadow-sm"></div>;
}

export default function ProvidersPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <ProviderHero />
      <div id="beneficios">
        <ProviderBenefits />
      </div>
      <div id="como-funciona">
        <ProviderHowItWorks />
      </div>
      <div id="faq">
        <ProviderFAQ />
      </div>
      <div id="contato">
        <ProviderCTA />
      </div>
      <Footer />
    </main>
  );
}
