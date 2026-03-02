import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { trackEvent } from '../../utils/analytics';
import type { AnxietyType } from '../../types/quiz';

const TYPE_COLORS: Record<AnxietyType, { badge: string; dot: string }> = {
  panic_cycle: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
  },
  hypervigilance: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-400',
  },
  catastrophizing: {
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  background_anxiety: {
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  overload: {
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
  },
};

export function ResultsPage() {
  const navigate = useNavigate();
  const { result, reset } = useQuizStore();

  useEffect(() => {
    if (!result) navigate('/test', { replace: true });
    else trackEvent('view_result', { type: result.type });
  }, [result, navigate]);

  if (!result) return null;

  const colors = TYPE_COLORS[result.type];

  function handleRestart() {
    reset();
    navigate('/test');
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          {/* Badge */}
          <div className="text-center">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${colors.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              Твій результат
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-white text-center">{result.title}</h1>

          {/* Free preview phrases */}
          <div className="flex flex-col gap-3">
            {result.previewPhrases.map((phrase, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white/80 text-base leading-relaxed"
              >
                {phrase}
              </div>
            ))}
          </div>

          {/* Paywall section */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            {/* Blurred content behind the gate */}
            <div
              className="flex flex-col gap-4 p-5 pointer-events-none select-none"
              style={{ filter: 'blur(6px)' }}
              aria-hidden="true"
            >
              <p className="text-white/70 text-base leading-relaxed">
                Детальний опис твого типу тривоги та причини його появи. Що відбувається в нервовій
                системі і чому симптоми саме такі.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Рекомендація</p>
                <p className="text-white/90 text-base">
                  Персоналізований план дій на основі твого типу тривоги.
                </p>
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/80 to-transparent flex flex-col items-center justify-end pb-6 px-5 gap-3">
              <p className="text-white/60 text-sm text-center">
                Повний аналіз + персональний план дій
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => { trackEvent('click_paywall'); navigate('/checkout'); }}
              >
                Розблокувати — від 29 грн
              </Button>
            </div>
          </div>

          {/* Restart */}
          <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
            Пройти ще раз
          </Button>
        </div>
      </main>
    </div>
  );
}
