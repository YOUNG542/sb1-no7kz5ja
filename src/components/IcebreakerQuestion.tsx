import React, { useState } from 'react';

interface IcebreakerQuestionProps {
  onComplete: (answers: string[]) => void;
  disabled?: boolean;
}

const QUESTIONS = [
  '당신의 이상형은 어떤 사람인가요?',
  '데이트할 때 가장 중요하게 생각하는 건 뭔가요?',
  '고백은 먼저 하는 편인가요?',
  '사랑보다 우정을 더 중요하게 생각하나요?',
  '헤어진 후 친구로 지낼 수 있나요?'
];

export const IcebreakerQuestion: React.FC<IcebreakerQuestionProps> = ({
  onComplete,
  disabled = false
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInput = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!answers[step].trim()) return;

    if (step === QUESTIONS.length - 1) {
      setIsSubmitting(true);
      onComplete(answers);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold text-pink-600 mb-4">
          궁합 질문 {step + 1} / {QUESTIONS.length}
        </h2>
        <p className="text-gray-800 mb-4">{QUESTIONS[step]}</p>
        <textarea
          value={answers[step]}
          onChange={(e) => handleInput(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
          rows={3}
          placeholder="당신의 생각을 자유롭게 적어주세요"
          disabled={disabled || isSubmitting}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!answers[step].trim() || isSubmitting}
            className="bg-pink-500 text-white px-5 py-2 rounded-lg hover:bg-pink-600 transition-all disabled:opacity-50"
          >
            {step === QUESTIONS.length - 1 ? '제출하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};
