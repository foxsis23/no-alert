export interface QuizQuestion {
  id: number;
  text: string;
}

export interface AnswerOption {
  label: string;
  score: number;
}

export type AnxietyLevel = 'situational' | 'generalized' | 'panic';

export interface AnxietyResult {
  level: AnxietyLevel;
  title: string;
  description: string;
  recommendation: string;
  score: number;
}
