import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AnxietyResult } from '../types/quiz';
import { QUIZ_QUESTIONS } from '../data/questions';
import { computeAnxietyResult } from '../data/anxietyTypes';

interface QuizState {
  answers: number[];
  currentQuestion: number;
  result: AnxietyResult | null;
  selectedProductId: string | null;
  purchasedProductIds: string[];
}

interface QuizActions {
  setAnswer: (questionIndex: number, score: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  computeResult: () => void;
  setSelectedProductId: (id: string) => void;
  addPurchasedProduct: (id: string) => void;
  reset: () => void;
}

const initialState: QuizState = {
  answers: new Array(QUIZ_QUESTIONS.length).fill(-1),
  currentQuestion: 0,
  result: null,
  selectedProductId: null,
  purchasedProductIds: [],
};

export const useQuizStore = create<QuizState & QuizActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAnswer: (questionIndex, score) =>
        set((state) => {
          const answers = [...state.answers];
          answers[questionIndex] = score;
          return { answers };
        }),

      nextQuestion: () =>
        set((state) => ({
          currentQuestion: Math.min(state.currentQuestion + 1, QUIZ_QUESTIONS.length - 1),
        })),

      prevQuestion: () =>
        set((state) => ({
          currentQuestion: Math.max(state.currentQuestion - 1, 0),
        })),

      computeResult: () => {
        const { answers } = get();
        set({ result: computeAnxietyResult(answers) });
      },

      setSelectedProductId: (id) => set({ selectedProductId: id }),

      addPurchasedProduct: (id) =>
        set((state) => ({
          purchasedProductIds: state.purchasedProductIds.includes(id)
            ? state.purchasedProductIds
            : [...state.purchasedProductIds, id],
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'quiz-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        result: state.result,
        selectedProductId: state.selectedProductId,
        purchasedProductIds: state.purchasedProductIds,
      }),
    },
  ),
);
