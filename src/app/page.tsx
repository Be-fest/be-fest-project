'use client';

import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
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
  );
}
