const TYPES = [
  {
    icon: '⚡',
    title: 'Панічний цикл',
    description: 'Раптові напади страху, серцебиття, задишка без видимої причини. Тіло реагує на помилкову загрозу.',
  },
  {
    icon: '🔍',
    title: 'Тілесна гіперфіксація',
    description: 'Постійне прислухання до тіла, пошук симптомів, тривога від нормальних відчуттів.',
  },
  {
    icon: '🔄',
    title: 'Страх повторення',
    description: 'Очікування наступного нападу. Уникання місць і ситуацій, де вже було погано.',
  },
  {
    icon: '🌫️',
    title: 'Фонова напруга',
    description: 'Хронічне напруження без конкретної причини. Складно розслабитись навіть у спокійній обстановці.',
  },
  {
    icon: '🔀',
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
          {TYPES.map((type, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/8 transition-colors"
            >
              <span className="text-3xl">{type.icon}</span>
              <h3 className="text-white font-bold text-lg">{type.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
