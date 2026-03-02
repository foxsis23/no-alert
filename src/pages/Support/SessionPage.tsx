import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { SCENARIOS } from '../../data/scenarios';
import type { ScenarioType } from '../../data/scenarios';

const RATING_OPTIONS = [
  { score: 1, emoji: '\u{1F61F}', label: 'Дуже погано' },
  { score: 2, emoji: '\u{1F615}', label: 'Погано' },
  { score: 3, emoji: '\u{1F610}', label: 'Нейтрально' },
  { score: 4, emoji: '\u{1F642}', label: 'Краще' },
  { score: 5, emoji: '\u{1F60C}', label: 'Значно краще' },
];

type Phase = 'session' | 'rating' | 'done';

export function SessionPage() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('session');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const scenario = SCENARIOS[type as ScenarioType];

  if (!scenario) {
    navigate('/support', { replace: true });
    return null;
  }

  const currentPhrase = scenario.phrases[phraseIndex];
  const isLastPhrase = phraseIndex === scenario.phrases.length - 1;
  const progress = Math.round(((phraseIndex + 1) / scenario.phrases.length) * 100);

  function handleNext() {
    if (isLastPhrase) {
      setPhase('rating');
    } else {
      setPhraseIndex((i) => i + 1);
    }
  }

  function handleRating(score: number) {
    setSelectedRating(score);
    setPhase('done');
  }

  if (phase === 'done') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
          <div className="w-full max-w-md flex flex-col gap-6 items-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center text-4xl">
              {'\u2713'}
            </div>
            <h1 className="text-3xl font-black text-white">Добре зроблено</h1>
            <p className="text-white/60 text-base">
              Ти пройшов через це. Кожен раз стає трохи легше.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/support')}>
              Повернутись до підтримки
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (phase === 'rating') {
    return (
      <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
          <div className="w-full max-w-md flex flex-col gap-8 text-center">
            <h2 className="text-2xl font-black text-white">Як ти себе почуваєш?</h2>
            <p className="text-white/50">Порівняно з початком сесії</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => handleRating(opt.score)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 min-w-[60px] ${
                    selectedRating === opt.score
                      ? 'border-[#f5a623] bg-[#f5a623]/10'
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-white/50 text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Header + progress */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/support')}
                className="text-white/40 hover:text-white/70 transition-colors text-sm"
              >
                {'\u2190'} Вийти
              </button>
              <span className="text-white/40 text-sm">
                {phraseIndex + 1} / {scenario.phrases.length}
              </span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f5a623] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Phrase card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[180px] flex items-center justify-center">
            <p className="text-white text-xl font-medium text-center leading-relaxed">
              {currentPhrase}
            </p>
          </div>

          {/* Next button */}
          <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
            {isLastPhrase ? 'Завершити' : `Далі ${'\u2192'}`}
          </Button>
        </div>
      </main>
    </div>
  );
}
