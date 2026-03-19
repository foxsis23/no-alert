import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export function ResultExample() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-6">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-black text-white text-center mb-3">
          Що ви отримаєте
        </h2>
        <p className="text-white/50 text-center mb-10">
          Безкоштовно: тип тривоги + 2 ключові спостереження
        </p>

        {/* Free result preview mockup */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Твій результат
            </span>
          </div>
          <h3 className="text-2xl font-black text-white">Панічний цикл</h3>
          <div className="flex flex-col gap-2">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm">
              Твоє тіло реагує на помилкову тривогу як на реальну небезпеку.
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm">
              Це виснажливо — але є конкретні техніки, які розривають цей цикл.
            </div>
          </div>

          {/* Blurred paywall area */}
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <div
              className="p-4 text-white/60 text-sm leading-relaxed"
              style={{ filter: 'blur(5px)' }}
              aria-hidden="true"
            >
              <p>Детальний опис механізму тривоги та чому симптоми саме такі. Персоналізований план дій.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/90 to-transparent flex items-end justify-center pb-3">
              <span className="text-white/40 text-xs">Доступно після оплати</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center flex flex-col items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/test')}
            className="min-w-64"
          >
            Пройти тест — від 29 грн
          </Button>
          <p className="text-white/30 text-xs">Результат за 2 хвилини. Повний аналіз одразу після оплати.</p>
        </div>
      </div>
    </section>
  );
}
