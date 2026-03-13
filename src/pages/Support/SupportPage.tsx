import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { getAllProducts } from '../../data/products';
import { Header } from '../../components/layout/Header';
import { trackEvent } from '../../utils/analytics';

const SCENARIOS = [
  {
    type: 'panic_wave',
    emoji: '\u{1F30A}',
    title: 'Мене накрило',
    description: "Паніка зараз, серце б'є, важко дихати",
  },
  {
    type: 'after_effect',
    emoji: '\u{1F32B}\u{FE0F}',
    title: 'Не відпускає',
    description: 'Після нападу — слабкість, тремтіння, спустошення',
  },
  {
    type: 'fear_of_repeat',
    emoji: '\u{1F504}',
    title: 'Боюсь повторення',
    description: 'Страх, що це станеться знову',
  },
] as const;

export function SupportPage() {
  const navigate = useNavigate();
  const { purchasedProductIds } = useQuizStore();
  const allProducts = getAllProducts();
  const hasSupportAccess = purchasedProductIds.some(
    (id) => allProducts.find((p) => p.id === id)?.hasSupport,
  );

  useEffect(() => {
    if (!hasSupportAccess) {
      navigate('/checkout', { replace: true });
    } else {
      trackEvent('enter_support');
    }
  }, [hasSupportAccess, navigate]);

  if (!hasSupportAccess) return null;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl font-black text-white">Підтримка</h1>
            <p className="text-white/50 mt-2">Що відбувається зараз?</p>
          </div>

          <div className="flex flex-col gap-4">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.type}
                onClick={() => navigate(`/support/session/${scenario.type}`)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl p-6 text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{scenario.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg group-hover:text-[#f5a623] transition-colors">
                      {scenario.title}
                    </p>
                    <p className="text-white/50 text-sm mt-1">{scenario.description}</p>
                  </div>
                  <span className="text-white/30 group-hover:text-white/60 transition-colors text-xl">{'\u2192'}</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-white/25 text-xs leading-relaxed">
            Це не медична послуга і не замінює звернення до лікаря чи психолога.
            Матеріали мають інформаційний та підтримуючий характер.
          </p>
        </div>
      </main>
    </div>
  );
}
