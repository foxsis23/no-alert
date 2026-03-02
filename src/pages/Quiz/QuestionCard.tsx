import type { AnswerOption } from '../../types/quiz';

interface QuestionCardProps {
  question: string;
  options: AnswerOption[];
  selectedScore: number;
  onSelect: (score: number) => void;
}

export function QuestionCard({
  question,
  options,
  selectedScore,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-snug">
        {question}
      </h2>

      <div className="flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = selectedScore === option.score;
          return (
            <button
              key={option.score}
              onClick={() => onSelect(option.score)}
              className={`w-full py-4 px-6 rounded-xl border text-base font-medium transition-all duration-200 text-left
                ${
                  isSelected
                    ? 'bg-[#f5a623] border-[#f5a623] text-black'
                    : 'bg-white/5 border-white/15 text-white hover:border-[#f5a623]/50 hover:bg-white/10'
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
