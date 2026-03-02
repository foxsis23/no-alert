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
  | 'hypervigilance'
  | 'catastrophizing'
  | 'background_anxiety'
  | 'overload';

export interface AnxietyResult {
  type: AnxietyType;
  title: string;
  previewPhrases: readonly [string, string];
  description: string;
  recommendation: string;
  scores: Record<AnxietyType, number>;
}
