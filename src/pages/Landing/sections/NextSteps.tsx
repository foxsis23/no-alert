const STEPS = [
  {
    icon: '🎧',
    title: 'Аудіо при паніці',
    price: '49 грн',
    description: '5-хвилинне аудіо, що зупиняє напад паніки. Слухайте у будь-який момент.',
  },
  {
    icon: '📅',
    title: 'Стабільність 7 днів',
    price: '79 грн',
    description: 'Щоденний протокол відновлення нервової системи на тиждень.',
  },
  {
    icon: '💬',
    title: 'Підтримка 7 днів',
    price: '149 грн',
    description: 'Персональний супровід і відповіді на ваші запитання протягом тижня.',
  },
  {
    icon: '📚',
    title: 'Повний курс',
    price: '249 грн',
    description: 'Авторський курс психіатра — від причин тривоги до стійких змін.',
  },
];

export function NextSteps() {
  return (
    <section className="py-20 px-6 bg-[#1a1a2e]/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center mb-3">
          Якщо хочете пройти далі
        </h2>
        <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">
          Після отримання результату — оберіть формат підтримки, що підходить саме вам
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl">{step.icon}</span>
                <span className="text-[#f5a623] font-bold text-sm shrink-0">{step.price}</span>
              </div>
              <h3 className="text-white font-bold text-lg">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
