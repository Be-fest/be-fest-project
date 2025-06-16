import { Hero } from '@/components/Hero';
import { Categories } from '@/components/Categories';
import { ProvidersGrid } from '@/components/ProvidersGrid';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Categories />
      <ProvidersGrid />
    </main>
  );
}
