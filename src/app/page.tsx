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
  return (
    <main className="min-h-screen">
      <Hero />
      <div id="categorias">
        <Categories />
      </div>
      <ProvidersGrid />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <AboutUs />
      <FAQ />
      <CTA />
      <div id="contatos">
        <Footer />
      </div>
    </main>
  );
}
