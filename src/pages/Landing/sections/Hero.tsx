import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { trackEvent } from '../../../utils/analytics';

export function Hero() {
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('view_landing');
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0d0d1a]" />

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg">
        <h1 className="text-6xl md:text-7xl font-black text-white leading-tight">
          Накриває?
        </h1>
        <p className="text-xl text-white/70">
          Зараз перевіримо, що це.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/test')}
          className="min-w-48 mt-2 text-xl shadow-lg shadow-[#f5a623]/20"
        >
          Почати
        </Button>
      </div>
    </section>
  );
}
