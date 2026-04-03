import { useState } from 'react';

const FAQ_ITEMS = [
  {
    question: 'Чи є це медичним діагнозом?',
    answer: 'Ні. Тест визначає домінуючий тип тривожної реакції на основі ваших відповідей. Це не медичний діагноз і не замінює консультацію лікаря. При серйозних симптомах зверніться до фахівця.',
  },
  {
    question: 'Скільки часу займає тест?',
    answer: '2–3 хвилини. 10 питань з трьома варіантами відповіді. Результат — одразу після останнього питання.',
  },
  {
    question: 'Що входить у результат за 29 грн?',
    answer: 'Повний опис вашого типу тривоги, механізм його виникнення, персоналізований план дій і конкретні техніки для початку роботи зі станом.',
  },
  {
    question: 'Чи можна повернути кошти?',
    answer: 'Так. Якщо ви не задоволені результатом протягом 24 годин після оплати — напишіть на info@tryvoga.net і ми повернемо кошти без зайвих запитань.',
  },
  {
    question: 'Мої дані в безпеці?',
    answer: 'Так. Відповіді на питання тесту не зберігаються на сервері — вони обробляються виключно у вашому браузері. Email використовується лише для доставки результату.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-white text-center mb-12">
          Часті запитання
        </h2>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-semibold text-base">{item.question}</span>
                <span
                  className={`text-white/40 text-xl shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${openIndex === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-white/60 text-sm leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
