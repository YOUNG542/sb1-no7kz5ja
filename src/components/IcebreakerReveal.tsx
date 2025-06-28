// IcebreakerReveal.tsx
import React from 'react';

interface IcebreakerRevealProps {
  questions: string[];
  myAnswers: string[];
  otherAnswers: string[];
  otherNickname: string;
  onClose: () => void;
}

export const IcebreakerReveal: React.FC<IcebreakerRevealProps> = ({
  questions,
  myAnswers,
  otherAnswers,
  otherNickname,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-xl w-full shadow-xl">
        <h2 className="text-xl font-bold text-pink-600 mb-4 text-center">
          🎉 서로의 궁합 질문 결과!
        </h2>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {questions.map((q, i) => (
            <div key={i} className="bg-pink-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-800 mb-2">Q{i + 1}. {q}</p>
              <div className="text-sm text-gray-700">
                <p><span className="font-semibold text-pink-600">나:</span> {myAnswers[i] || '-'}</p>
                <p><span className="font-semibold text-red-500">{otherNickname}:</span> {otherAnswers[i] || '-'}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
