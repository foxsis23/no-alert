import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Hero } from './sections/Hero';
import { Symptoms } from './sections/Symptoms';
import { HowItWorks } from './sections/HowItWorks';
import { AnxietyTypesBlock } from './sections/AnxietyTypesBlock';
import { Trust } from './sections/Trust';
import { ResultExample } from './sections/ResultExample';
import { Pricing } from './sections/Pricing';
import { NextSteps } from './sections/NextSteps';
import { FAQ } from './sections/FAQ';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <Header />
      <main>
        <Hero />
        <Symptoms />
        <HowItWorks />
        <AnxietyTypesBlock />
        <Trust />
        <ResultExample />
        <Pricing />
        <NextSteps />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
