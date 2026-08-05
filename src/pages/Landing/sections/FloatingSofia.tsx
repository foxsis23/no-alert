import { useEffect, useState } from 'react';
import { trackEvent } from '../../../utils/analytics';

const SOFIA_LINK = 'https://t.me/gss_sofia_bot?start=partner_tryvoga';

export function FloatingSofia() {
  // While the Sofia section is on screen the badge "flies" toward the card
  // (up-left, shrinking) and fades out, then returns when scrolled past.
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const target = document.getElementById('sofia');
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setDocked(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href={SOFIA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('click_sofia_floating')}
      aria-label="Поговорити з Софією"
      className={`fixed bottom-5 right-5 z-50 transition-all duration-700 ease-out ${
        docked
          ? 'opacity-0 -translate-x-10 -translate-y-24 scale-75 pointer-events-none'
          : 'opacity-100 translate-x-0 translate-y-0 scale-100'
      }`}
    >
      <span
        className={`flex items-center gap-3 rounded-full bg-[#12121f] ring-1 ring-[#f5a623]/40 shadow-lg shadow-black/50 pl-2 pr-4 py-2 ${
          docked ? '' : 'sofia-float'
        }`}
      >
        <span className="relative shrink-0">
          <img
            src="/sofia-avatar.webp"
            alt=""
            width={44}
            height={44}
            className="w-11 h-11 rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-[#12121f] animate-pulse" />
        </span>
        <span className="hidden sm:block text-sm font-semibold text-white whitespace-nowrap">
          Поговорити з Софією
        </span>
      </span>
    </a>
  );
}
