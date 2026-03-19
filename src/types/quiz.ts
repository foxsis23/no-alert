export interface QuizQuestion {
  id: number;
  text: string;
  weights: Record<AnxietyType, number>;
}

export interface AnswerOption {
  label: string;
  score: number;
}

export type AnxietyType =
  | 'panic_cycle'
  | 'body_hyperfocus'
  | 'fear_of_recurrence'
  | 'background_tension'
  | 'combined_type';

export interface AnxietyResult {
  type: AnxietyType;
  title: string;
  previewPhrases: readonly [string, string];
  description: string;
  recommendation: string;
  scores: Record<AnxietyType, number>;
}
