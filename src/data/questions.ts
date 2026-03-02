import type { QuizQuestion, AnswerOption } from '../types/quiz';

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: 'Рідко', score: 0 },
  { label: 'Іноді', score: 1 },
  { label: 'Часто', score: 2 },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Чи буває у тебе серцебиття, задишка або тремтіння без видимої причини?',
    weights: { panic_cycle: 2, hypervigilance: 1, catastrophizing: 0, background_anxiety: 0, overload: 0 },
  },
  {
    id: 2,
    text: 'Чи виникають у тебе раптові хвилі страху або сильного неспокою?',
    weights: { panic_cycle: 2, hypervigilance: 0, catastrophizing: 0, background_anxiety: 0, overload: 1 },
  },
  {
    id: 3,
    text: 'Чи боїшся ти збожеволіти, вмерти або втратити контроль під час нападу тривоги?',
    weights: { panic_cycle: 2, hypervigilance: 0, catastrophizing: 1, background_anxiety: 0, overload: 0 },
  },
  {
    id: 4,
    text: 'Чи уникаєш ти певних місць або ситуацій через страх нового нападу?',
    weights: { panic_cycle: 1, hypervigilance: 2, catastrophizing: 0, background_anxiety: 0, overload: 0 },
  },
  {
    id: 5,
    text: 'Чи відчуваєш ти постійну настороженість, ніби щось ось-ось трапиться?',
    weights: { panic_cycle: 0, hypervigilance: 2, catastrophizing: 0, background_anxiety: 1, overload: 0 },
  },
  {
    id: 6,
    text: 'Чи думаєш ти найчастіше про найгірший можливий сценарій?',
    weights: { panic_cycle: 0, hypervigilance: 0, catastrophizing: 2, background_anxiety: 1, overload: 0 },
  },
  {
    id: 7,
    text: 'Чи важко тобі зупинити потік тривожних думок?',
    weights: { panic_cycle: 0, hypervigilance: 0, catastrophizing: 2, background_anxiety: 0, overload: 1 },
  },
  {
    id: 8,
    text: 'Чи відчуваєш ти тривогу майже весь час, навіть коли зовні все добре?',
    weights: { panic_cycle: 0, hypervigilance: 1, catastrophizing: 0, background_anxiety: 2, overload: 0 },
  },
  {
    id: 9,
    text: 'Чи виснажує тебе тривога фізично або емоційно?',
    weights: { panic_cycle: 0, hypervigilance: 0, catastrophizing: 0, background_anxiety: 1, overload: 2 },
  },
  {
    id: 10,
    text: 'Чи важко тобі розслабитись або відпочити навіть у спокійній обстановці?',
    weights: { panic_cycle: 0, hypervigilance: 0, catastrophizing: 1, background_anxiety: 0, overload: 2 },
  },
];
