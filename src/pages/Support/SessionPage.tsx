import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { SCENARIOS } from '../../data/scenarios';
import type { ScenarioType } from '../../data/scenarios';
import { trackEvent } from '../../utils/analytics';

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
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('session');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = SCENARIOS[type as ScenarioType];

  useEffect(() => {
    if (scenario) trackEvent(`start_session_${type}`);
  }, [scenario, type]);

  const advanceStep = useCallback(() => {
    if (!scenario) return;
    const isLast = stepIndex === scenario.steps.length - 1;
    if (isLast) {
      setPhase('rating');
    } else {
      setStepIndex((i) => i + 1);
      setTimerProgress(0);
    }
  }, [scenario, stepIndex]);

  // Auto-advance timer
  useEffect(() => {
    if (phase !== 'session' || paused || !scenario) return;

    const step = scenario.steps[stepIndex];
    if (!step || step.delaySeconds <= 0) return;

    const totalMs = step.delaySeconds * 1000;
    const tickMs = 50;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += tickMs;
      setTimerProgress(Math.min(elapsed / totalMs, 1));
      if (elapsed >= totalMs) {
        if (timerRef.current) clearInterval(timerRef.current);
        advanceStep();
      }
    }, tickMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, paused, scenario, stepIndex, advanceStep]);

  if (!scenario) {
    navigate('/support', { replace: true });
    return null;
  }

  const currentStep = scenario.steps[stepIndex];
  const isLastStep = stepIndex === scenario.steps.length - 1;
  const progress = Math.round(((stepIndex + 1) / scenario.steps.length) * 100);
  const hasTimer = currentStep.delaySeconds > 0;

  function handleNext() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerProgress(0);
    advanceStep();
  }

  function togglePause() {
    setPaused((p) => !p);
  }

  function handleRating(score: number) {
    setSelectedRating(score);
    trackEvent('finish_session', { type, score });
    setPhase('done');
  }

  // Done screen — different for low vs high rating
  if (phase === 'done') {
    const isLowRating = selectedRating !== null && selectedRating <= 2;

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

            {isLowRating && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left">
                <p className="text-white/70 text-sm leading-relaxed">
                  Якщо симптоми сильні, незвичні або не проходять — зверніться по
                  медичну допомогу. Це не означає, що щось серйозне, але лікар
                  допоможе виключити інші причини.
                </p>
              </div>
            )}

            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/support')}>
              Повернутись до підтримки
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Rating screen
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
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 min-w-[60px] cursor-pointer ${
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

  // Session screen
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
                className="text-white/40 hover:text-white/70 transition-colors text-sm cursor-pointer"
              >
                {'\u2190'} Вийти
              </button>
              <span className="text-white/40 text-sm">
                {stepIndex + 1} / {scenario.steps.length}
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[180px] flex flex-col items-center justify-center gap-4">
            <p className="text-white text-xl font-medium text-center leading-relaxed">
              {currentStep.text}
            </p>

            {/* Timer indicator */}
            {hasTimer && !paused && (
              <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/30 rounded-full transition-none"
                  style={{ width: `${timerProgress * 100}%` }}
                />
              </div>
            )}

            {paused && (
              <span className="text-white/30 text-sm">На паузі</span>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={togglePause}
            >
              {paused ? '\u25B6' : '\u23F8'} {paused ? 'Далі' : 'Пауза'}
            </Button>
            <div className="flex-1">
              <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
                {isLastStep ? 'Завершити' : `Далі ${'\u2192'}`}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
