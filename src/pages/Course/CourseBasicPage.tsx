import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuizStore } from '../../store/quizStore';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';

const TOAST_KEY = 'toast_shown_basic';

export function CourseBasicPage() {
  const navigate = useNavigate();
  const { result, purchasedProductIds } = useQuizStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const hasAccess = purchasedProductIds.includes('basic');

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
    else if (!hasAccess) navigate('/checkout', { replace: true });
  }, [result, hasAccess, navigate]);

  useEffect(() => {
    if (!result || !hasAccess) return;
    if (!sessionStorage.getItem(TOAST_KEY)) {
      toast.success('Ви отримали доступ до курсу!');
      sessionStorage.setItem(TOAST_KEY, '1');
    }
  }, [result, hasAccess]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleTimeUpdate() {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }

  function handleLoadedMetadata() {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }

  function handleEnded() {
    setIsPlaying(false);
    setCurrentTime(0);
  }

  function handleSeek(e: { target: HTMLInputElement }) {
    const time = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (!result || !hasAccess) return null;

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-6 py-24">
        <div className="w-full max-w-2xl flex flex-col gap-10">
          <div>
            <p className="text-[#f5a623] text-sm font-semibold uppercase tracking-wider mb-2">
              Ваш курс
            </p>
            <h1 className="text-4xl font-black text-white">Що робити зараз</h1>
            <p className="text-white/50 mt-2">
              Покрокові техніки для швидкого зняття тривоги прямо зараз.
            </p>
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white">Аудіо</h2>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-[#f5a623] hover:bg-[#f5a623]/80 text-[#0d0d1a] flex items-center justify-center shrink-0 transition-colors"
                >
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <rect x="4" y="3" width="4" height="14" rx="1" />
                      <rect x="12" y="3" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 4l12 6-12 6V4z" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-white font-medium text-sm">Що робити зараз.wav</p>
                  <p className="text-white/40 text-xs">
                    {formatTime(currentTime)}
                    {duration > 0 && ` / ${formatTime(duration)}`}
                  </p>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 accent-[#f5a623] cursor-pointer"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-white">Матеріали</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <p className="text-white/30">Текстові матеріали будуть тут</p>
            </div>
          </section>
        </div>
      </main>

      <audio
        ref={audioRef}
        src="/що-робити-зараз.wav"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <Footer />
    </div>
  );
}
