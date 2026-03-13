import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuizStore } from '../../store/quizStore';
import { getAllProducts } from '../../data/products';

const AUDIO_SRC = '/що-робити-зараз.wav';
const TOAST_KEY = 'toast_shown_panic_wave';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PanicAudioPage() {
  const navigate = useNavigate();
  const { purchasedProductIds } = useQuizStore();
  const allProducts = getAllProducts();
  const hasSupportAccess = purchasedProductIds.some(
    (id) => allProducts.find((p) => p.id === id)?.hasSupport,
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!hasSupportAccess) {
      navigate('/checkout', { replace: true });
      return;
    }
    if (!sessionStorage.getItem(TOAST_KEY)) {
      toast('Натисни play — і просто слухай. Будь поруч із собою.', {
        duration: 5000,
      });
      sessionStorage.setItem(TOAST_KEY, '1');
    }
  }, [hasSupportAccess, navigate]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
  }

  function handleTimeUpdate() {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }

  function handleLoadedMetadata() {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  }

  if (!hasSupportAccess) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <button
          onClick={() => navigate('/support')}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm self-start cursor-pointer"
        >
          <span>←</span>
          <span>Повернутись</span>
        </button>

        <div className="text-center flex flex-col gap-2">
          <p className="text-4xl">🌊</p>
          <h1 className="text-2xl font-black text-white">Мене накрило</h1>
          <p className="text-white/50 text-sm">Увімкни та просто слухай</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Пауза' : 'Відтворити'}
            className="w-20 h-20 rounded-full bg-[#f5a623] hover:bg-[#f5a623]/90 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-lg shadow-[#f5a623]/20 cursor-pointer"
          >
            {isPlaying ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <div className="w-full flex flex-col gap-2">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 appearance-none rounded-full cursor-pointer accent-[#f5a623]"
              style={{
                background: `linear-gradient(to right, #f5a623 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
              }}
            />
            <div className="flex justify-between text-white/30 text-xs">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
            </div>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs leading-relaxed">
          Це не медична послуга і не замінює звернення до лікаря чи психолога.
        </p>
      </div>

      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
