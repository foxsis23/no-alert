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
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0d0d1a]">
      {/* Background image (human photo, subject on the right) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.webp')" }}
      />

      {/* Left-to-right + bottom gradients keep the left-aligned text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a] via-[#0d0d1a]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/80 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
        <div className="max-w-lg flex flex-col items-start gap-6 text-left">
          <h1 className="text-6xl md:text-7xl font-black text-white leading-tight">
            Накриває?
          </h1>
          <p className="text-xl text-white/70">
            Зараз перевіримо, що це.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => { trackEvent('click_cta_hero'); navigate('/test'); }}
            className="min-w-48 mt-2 text-xl shadow-lg shadow-[#f5a623]/20"
          >
            Почати
          </Button>
        </div>
      </div>
    </section>
  );
}
