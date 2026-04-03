import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { useProducts } from '../../lib/queries';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { trackEvent } from '../../utils/analytics';
import type { AnxietyType } from '../../types/quiz';

const TYPE_COLORS: Record<AnxietyType, { badge: string; dot: string }> = {
  panic_cycle: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
  },
  body_hyperfocus: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-400',
  },
  fear_of_recurrence: {
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  background_tension: {
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  combined_type: {
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
  },
};

export function ResultsPage() {
  const navigate = useNavigate();
  const { result, resetQuiz } = useQuizStore();
  const { data: apiProducts } = useProducts();

  useEffect(() => {
    if (!result) navigate('/test', { replace: true });
    else trackEvent('view_result', { type: result.type });
  }, [result, navigate]);

  const minPrice = useMemo(() => {
    if (!apiProducts?.length) return null;
    return Math.min(...apiProducts.map((p) => parseFloat(p.price)));
  }, [apiProducts]);

  if (!result) return null;

  const colors = TYPE_COLORS[result.type];
  const title = result.title;
  const phrases = result.previewPhrases.slice(0, 2);

  function handleRestart() {
    resetQuiz();
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
          <h1 className="text-4xl font-black text-white text-center">{title}</h1>

          {/* Free preview phrases */}
          <div className="flex flex-col gap-3">
            {phrases.map((phrase, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white/80 text-base leading-relaxed"
              >
                {phrase}
              </div>
            ))}
          </div>

          {/* Full result info */}
          <div className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/80 text-base leading-relaxed">
              {result.description}
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Рекомендація</p>
              <p className="text-white/90 text-base">
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Buy CTA */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => { trackEvent('click_paywall', { type: result.type }); navigate('/checkout'); }}
          >
            {minPrice !== null ? `Купити курс — від ${minPrice} грн` : 'Купити курс'}
          </Button>

          {/* Restart */}
          <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
            Пройти ще раз
          </Button>
        </div>
      </main>
    </div>
  );
}
