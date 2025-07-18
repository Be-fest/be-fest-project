import { Header } from '@/components/Header';
import { ProviderHero } from '@/components/provider-page/ProviderHero';
import { ProviderBenefits } from '@/components/provider-page/ProviderBenefits';
import { ProviderHowItWorks } from '@/components/provider-page/ProviderHowItWorks';
import { ProviderFAQ } from '@/components/provider-page/ProviderFAQ';
import { ProviderCTA } from '@/components/provider-page/ProviderCTA';
import { Footer } from '@/components/Footer';

export default function ProvidersPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <ProviderHero />
      <div id="beneficios">
        <ProviderBenefits />
      </div>
      <div id="como-funciona">
        <ProviderHowItWorks />
      </div>
      <ProviderFAQ />
      <ProviderCTA />
      <Footer />
    </main>
  );
}
