import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { QUIZ_QUESTIONS } from '../data/questions';

export function useQuiz() {
  const navigate = useNavigate();
  const {
    answers,
    currentQuestion,
    setAnswer,
    nextQuestion,
    prevQuestion,
    computeResult,
  } = useQuizStore();

  const totalQuestions = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const hasAnswer = currentAnswer !== -1;

  function handleAnswer(score: number) {
    setAnswer(currentQuestion, score);
  }

  function handleNext() {
    if (!hasAnswer) return;
    if (isLastQuestion) {
      computeResult();
      navigate('/results');
    } else {
      nextQuestion();
    }
  }

  function handleBack() {
    if (isFirstQuestion) {
      navigate('/');
    } else {
      prevQuestion();
    }
  }

  return {
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
  };
}
