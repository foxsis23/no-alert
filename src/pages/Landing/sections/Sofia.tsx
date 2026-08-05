import { trackEvent } from '../../../utils/analytics';

const SOFIA_LINK = 'https://t.me/gss_sofia_bot?start=partner_tryvoga';

export function Sofia() {
  return (
    <section id="sofia" className="py-16 px-6 bg-[#0d0d1a] border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="sofia-glow flex flex-col sm:flex-row items-center gap-6 sm:gap-8 rounded-2xl bg-[#12121f] ring-1 ring-white/10 p-8">
          <span className="relative shrink-0">
            <span className="sofia-wave absolute inset-0 rounded-full border-2 border-[#f5a623]/40" />
            <span className="sofia-wave absolute inset-0 rounded-full border-2 border-[#f5a623]/40" style={{ animationDelay: '1.4s' }} />
            <img
              src="/sofia-avatar.webp"
              alt="Софія"
              width={120}
              height={120}
              loading="lazy"
              className="relative w-28 h-28 rounded-full object-cover ring-2 ring-[#f5a623]/50"
            />
          </span>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
            <p className="text-white/80 leading-relaxed">
              <span className="font-bold text-white">Софія</span> — твій ШІ-психолог у Telegram.
              Вислухає, підтримає й допоможе розібратися з тривогою — будь-коли, безкоштовно.
              Просто напиши їй.
            </p>

            <a
              href={SOFIA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('click_sofia_bot')}
              className="inline-flex items-center gap-2 font-bold rounded-lg px-8 py-4 text-lg bg-[#f5a623] hover:bg-[#e09510] text-black transition-all duration-200 shadow-lg shadow-[#f5a623]/20"
            >
              💬 Поговорити з Софією
            </a>

            <p className="text-xs text-white/40 leading-relaxed max-w-md">
              Софія — ШІ-підтримка, а не заміна професійної психологічної чи медичної допомоги.
              У кризовій ситуації або при загрозі життю звертайтесь до{' '}
              <a href="tel:7333" className="text-white/60 underline hover:text-white/80">
                Lifeline Ukraine 7333
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
