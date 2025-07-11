'use client';

import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { ProvidersGrid } from '@/components/ProvidersGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { Stats } from '@/components/Stats';
import { Testimonials } from '@/components/Testimonials';
import { AboutUs } from '@/components/AboutUs';
import { FAQ } from '@/components/FAQ';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/Footer';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? undefined : category);
  };

  return (
    <main className="min-h-screen">
      <Hero />
      <div id="categorias">
        <Categories onCategorySelect={handleCategorySelect} />
      </div>
      <div id="prestadores">
        <ProvidersGrid selectedCategory={selectedCategory} />
      </div>
      <div id="como-funciona">
        <HowItWorks />
      </div>
      <Stats />
      <div id="depoimentos">
        <Testimonials />
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
  );
}
