import { useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { QuestionCard } from './QuestionCard';
import { useQuiz } from '../../hooks/useQuiz';
import { ANSWER_OPTIONS } from '../../data/questions';
import { trackEvent } from '../../utils/analytics';

export function QuizPage() {
  const {
    question,
    currentQuestion,
    totalQuestions,
    currentAnswer,
    isFirstQuestion,
    isLastQuestion,
    hasAnswer,
    handleAnswer,
    handleNext,
    handleBack,
  } = useQuiz();

  useEffect(() => {
    trackEvent('start_test');
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-lg flex flex-col gap-8">
          <ProgressBar current={currentQuestion + 1} total={totalQuestions} />

          <QuestionCard
            question={question.text}
            options={ANSWER_OPTIONS}
            selectedScore={currentAnswer}
            onSelect={handleAnswer}
          />

          <div className="flex gap-3 mt-2">
            <Button
              variant="ghost"
              size="md"
              onClick={handleBack}
              className="flex-1"
            >
              {isFirstQuestion ? 'На головну' : 'Назад'}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={!hasAnswer}
              className="flex-[2]"
            >
              {isLastQuestion ? 'Переглянути результат' : 'Далі'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
