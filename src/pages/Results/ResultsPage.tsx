import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import type { AnxietyLevel } from '../../types/quiz';

const LEVEL_COLORS: Record<AnxietyLevel, { badge: string; bar: string }> = {
  situational: { badge: 'bg-green-500/20 text-green-400 border-green-500/30', bar: 'bg-green-400' },
  generalized: { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-400' },
  panic: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', bar: 'bg-red-400' },
};

const MAX_SCORE = 24;

export function ResultsPage() {
  const navigate = useNavigate();
  const { result, reset } = useQuizStore();

  useEffect(() => {
    if (!result) navigate('/test', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const colors = LEVEL_COLORS[result.level];
  const scorePercent = Math.round((result.score / MAX_SCORE) * 100);
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setAnimatedWidth(scorePercent));
  }, [scorePercent]);

  function handleRestart() {
    reset();
    navigate('/test');
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8 text-center">
          {/* Badge */}
          <div>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold border ${colors.badge}`}
            >
              Твій результат
            </span>
          </div>

          {/* Anxiety type title */}
          <h1 className="text-4xl font-black text-white">{result.title}</h1>

          {/* Score bar */}
          <div className="flex flex-col gap-2">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
                style={{ width: `${animatedWidth}%` }}
              />
            </div>
            <p className="text-xs text-white/40">Рівень тривоги: {result.score}/{MAX_SCORE}</p>
          </div>

          {/* Description */}
          <p className="text-white/70 text-base leading-relaxed">
            {result.description}
          </p>

          {/* Recommendation box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Рекомендація</p>
            <p className="text-white/90 text-base">{result.recommendation}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/checkout')}>
              Отримати допомогу
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={handleRestart}>
              Пройти ще раз
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
