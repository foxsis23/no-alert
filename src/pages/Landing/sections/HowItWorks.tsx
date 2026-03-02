const STEPS = [
  { icon: '👤', label: 'Відповідаєш на питання', step: 1 },
  { icon: '✅', label: 'Дізнаєшся свій тип тривоги', step: 2 },
  { icon: '💡', label: 'Отримуєш, що робити зараз', step: 3 },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-6 bg-[#0d0d1a] border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Як це працює
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {STEPS.map((step, index) => (
            <>
              <div key={step.step} className="flex flex-col items-center gap-3 flex-1 max-w-[140px]">
                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl">
                  {step.icon}
                </div>
                <p className="text-sm text-white/70 text-center leading-tight">
                  <span className="text-white/40">{step.step}. </span>
                  {step.label}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div key={`arrow-${step.step}`} className="hidden sm:block text-white/30 text-2xl flex-shrink-0">→</div>
              )}
            </>
          ))}
        </div>

        <p className="text-center text-white/40 text-sm mt-10">
          Це не медпослуга. Не замінює звернення до лікаря.
        </p>
      </div>
    </section>
  );
}
