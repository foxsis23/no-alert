import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Hero } from './sections/Hero';
import { Symptoms } from './sections/Symptoms';
import { HowItWorks } from './sections/HowItWorks';
import { Pricing } from './sections/Pricing';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <Header />
      <main>
        <Hero />
        <Symptoms />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
