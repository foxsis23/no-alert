import { Zap, Search, RefreshCw, Gauge, Shuffle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TYPES: { Icon: LucideIcon; title: string; description: string }[] = [
  {
    Icon: Zap,
    title: 'Панічний цикл',
    description: 'Раптові напади страху, серцебиття, задишка без видимої причини. Тіло реагує на помилкову загрозу.',
  },
  {
    Icon: Search,
    title: 'Тілесна гіперфіксація',
    description: 'Постійне прислухання до тіла, пошук симптомів, тривога від нормальних відчуттів.',
  },
  {
    Icon: RefreshCw,
    title: 'Страх повторення',
    description: 'Очікування наступного нападу. Уникання місць і ситуацій, де вже було погано.',
  },
  {
    Icon: Gauge,
    title: 'Фонова напруга',
    description: 'Хронічне напруження без конкретної причини. Складно розслабитись навіть у спокійній обстановці.',
  },
  {
    Icon: Shuffle,
    title: 'Змішана тривога',
    description: 'Кілька видів тривоги одночасно. Стан, що потребує комплексного підходу.',
  },
];

export function AnxietyTypesBlock() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center mb-3">
          5 типів тривоги — який ваш?
        </h2>
        <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
          Тест визначає домінуючий тип і дає персоналізований план дій
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TYPES.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="bg-[#12121f] border border-white/10 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#f5a623]/40 transition-colors"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#f5a623]/10">
                <Icon className="w-6 h-6 text-[#f5a623]" strokeWidth={1.75} />
              </div>
              <h3 className="text-white font-bold text-lg">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
