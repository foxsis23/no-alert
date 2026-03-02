export type ScenarioType = 'panic_wave' | 'after_effect' | 'fear_of_repeat';

export interface ScenarioStep {
  text: string;
  delaySeconds: number;
}

export interface Scenario {
  type: ScenarioType;
  title: string;
  steps: ScenarioStep[];
}

export const SCENARIOS: Record<ScenarioType, Scenario> = {
  panic_wave: {
    type: 'panic_wave',
    title: 'Мене накрило',
    steps: [
      { text: 'Зупинись. Ти в безпеці прямо зараз.', delaySeconds: 6 },
      { text: 'Зроби повільний вдих — на 4 рахунки.', delaySeconds: 5 },
      { text: 'Затримай повітря — на 4 рахунки.', delaySeconds: 5 },
      { text: 'Повільно видихни — на 6 рахунків.', delaySeconds: 7 },
      { text: 'Паніка — це хвиля. Вона досягне піку і спаде.', delaySeconds: 6 },
      { text: 'Твоє тіло реагує на помилкову тривогу. Небезпеки немає.', delaySeconds: 6 },
      { text: 'Продовжуй дихати. Ти справляєшся.', delaySeconds: 5 },
      { text: 'Хвиля відступає. Ти впорався.', delaySeconds: 0 },
    ],
  },
  after_effect: {
    type: 'after_effect',
    title: 'Не відпускає',
    steps: [
      { text: 'Найгостріше вже позаду.', delaySeconds: 5 },
      { text: 'Твоє тіло зараз відновлюється — це нормально.', delaySeconds: 6 },
      { text: 'Тремтіння або слабкість після нападу — природна реакція.', delaySeconds: 6 },
      { text: 'Дай собі 15–20 хвилин спокою.', delaySeconds: 5 },
      { text: 'Якщо можеш — випий трохи води.', delaySeconds: 5 },
      { text: 'Ти не зробив нічого поганого. Це просто тіло.', delaySeconds: 6 },
      { text: 'Завтра буде легше.', delaySeconds: 0 },
    ],
  },
  fear_of_repeat: {
    type: 'fear_of_repeat',
    title: 'Боюсь повторення',
    steps: [
      { text: 'Страх повторення — сам по собі не небезпечний.', delaySeconds: 6 },
      { text: "Він не означає, що атака обов'язково станеться знову.", delaySeconds: 6 },
      { text: 'Твоє тіло вчиться реагувати інакше.', delaySeconds: 5 },
      { text: 'Кожен раз, коли ти проходиш через це, стає трохи легше.', delaySeconds: 6 },
      { text: 'Уникання підсилює страх. Ти вже зробив правильний крок — ти тут.', delaySeconds: 6 },
      { text: 'Ти вже знаєш — це минає.', delaySeconds: 0 },
    ],
  },
};
