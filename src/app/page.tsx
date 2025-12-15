'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { CreatePartyCTA } from '@/components/CreatePartyCTA';
import { CategoriesSection } from '@/components/CategoriesSection';
import { ServicesSection } from '@/components/ServicesSection';
import { HowItWorks } from '@/components/HowItWorks';
import { AboutUs } from '@/components/AboutUs';
import { FAQ } from '@/components/FAQ';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';
import { ClientOnlyGuard } from '@/components/guards/ClientOnlyGuard';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? undefined : category);
  };

  return (
    <ClientOnlyGuard>
      <main className="min-h-screen">
        <Hero />
        <CreatePartyCTA />
        <div id="servicos">
          <ServicesSection />
        </div>
        <div id="como-funciona">
          <HowItWorks />
        </div>
        <div id="sobre-nos">
          <AboutUs />
        </div>
        <div id="faq">
          <FAQ />
        </div>
        <CTA />
        <div id="contatos">
          <Footer />
        </div>
      </main>
    </ClientOnlyGuard>
  );
}
