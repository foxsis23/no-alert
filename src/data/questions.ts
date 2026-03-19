import type { QuizQuestion, AnswerOption } from '../types/quiz';

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: 'Рідко', score: 0 },
  { label: 'Іноді', score: 1 },
  { label: 'Часто', score: 2 },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'Чи бувають у вас раптові напади страху або паніки?',
    weights: { panic_cycle: 2, body_hyperfocus: 0, fear_of_recurrence: 0, background_tension: 0, combined_type: 0 },
  },
  {
    id: 2,
    text: 'Чи виникає різке серцебиття або задишка без видимої причини?',
    weights: { panic_cycle: 2, body_hyperfocus: 1, fear_of_recurrence: 0, background_tension: 0, combined_type: 0 },
  },
  {
    id: 3,
    text: 'Чи відстежуєте ви відчуття у тілі протягом дня?',
    weights: { panic_cycle: 0, body_hyperfocus: 2, fear_of_recurrence: 0, background_tension: 0, combined_type: 0 },
  },
  {
    id: 4,
    text: 'Чи боїтеся ви, що напад може повторитися?',
    weights: { panic_cycle: 0, body_hyperfocus: 0, fear_of_recurrence: 2, background_tension: 0, combined_type: 0 },
  },
  {
    id: 5,
    text: 'Чи уникаєте місць або ситуацій, де вже відчували тривогу?',
    weights: { panic_cycle: 0, body_hyperfocus: 0, fear_of_recurrence: 2, background_tension: 0, combined_type: 0 },
  },
  {
    id: 6,
    text: 'Чи відчуваєте постійне напруження навіть без явної причини?',
    weights: { panic_cycle: 0, body_hyperfocus: 0, fear_of_recurrence: 0, background_tension: 2, combined_type: 0 },
  },
  {
    id: 7,
    text: 'Чи читаєте про свої симптоми в інтернеті?',
    weights: { panic_cycle: 0, body_hyperfocus: 2, fear_of_recurrence: 1, background_tension: 0, combined_type: 0 },
  },
  {
    id: 8,
    text: 'Чи важко розслабитися навіть коли зовні все спокійно?',
    weights: { panic_cycle: 0, body_hyperfocus: 0, fear_of_recurrence: 0, background_tension: 2, combined_type: 0 },
  },
  {
    id: 9,
    text: 'Чи переслідує думка «а раптом це знову станеться»?',
    weights: { panic_cycle: 0, body_hyperfocus: 0, fear_of_recurrence: 2, background_tension: 1, combined_type: 0 },
  },
  {
    id: 10,
    text: 'Чи потребуєте постійно перевіряти своє самопочуття?',
    weights: { panic_cycle: 0, body_hyperfocus: 2, fear_of_recurrence: 0, background_tension: 0, combined_type: 0 },
  },
];
