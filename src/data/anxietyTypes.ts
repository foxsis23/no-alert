import type { AnxietyResult, AnxietyLevel } from '../types/quiz';

export const ANXIETY_RESULTS: Record<AnxietyLevel, Omit<AnxietyResult, 'score'>> = {
  situational: {
    level: 'situational',
    title: 'Ситуативна тривога',
    description:
      "Твій рівень тривоги помірний і, найімовірніше, пов'язаний з конкретними стресовими ситуаціями. Це нормальна реакція організму на виклики.",
    recommendation:
      'Техніки самодопомоги та базові вправи можуть значно покращити твій стан.',
  },
  generalized: {
    level: 'generalized',
    title: 'Генералізована тривога',
    description:
      'Ти відчуваєш підвищений рівень тривоги, що впливає на різні сфери твого життя. Твій організм перебуває в стані хронічного стресу.',
    recommendation:
      'Рекомендуємо структурований курс із практиками та підтримкою спеціаліста.',
  },
  panic: {
    level: 'panic',
    title: 'Панічний розлад',
    description:
      'Твої симптоми вказують на високий рівень тривоги з ознаками панічних атак. Це виснажливо, але з цим можна ефективно впоратись.',
    recommendation:
      'Рекомендуємо негайну підтримку — персональний супровід фахівця протягом 7 днів.',
  },
};

export function computeAnxietyResult(totalScore: number): AnxietyResult {
  let level: AnxietyLevel;
  if (totalScore <= 8) level = 'situational';
  else if (totalScore <= 16) level = 'generalized';
  else level = 'panic';

  return { ...ANXIETY_RESULTS[level], score: totalScore };
}
