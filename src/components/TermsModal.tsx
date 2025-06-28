// src/components/TermsModal.tsx

import React, { useState } from 'react';

interface TermsModalProps {
  onAgree: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAgree }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">서비스 이용 동의</h2>
        <p className="text-sm text-gray-600 mb-4">
          서비스를 계속 이용하시려면 아래 약관에 동의해 주세요.
        </p>

        <div className="text-sm text-gray-700 mb-4 flex items-start gap-2">
          <input
            type="checkbox"
            id="agree"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agree">
            <span
              className="underline text-pink-500 cursor-pointer"
              onClick={() => window.open('/terms-of-service', '_blank')}
            >
              이용약관
            </span>{' '}
            및{' '}
            <span
              className="underline text-pink-500 cursor-pointer"
              onClick={() => window.open('/privacy-policy', '_blank')}
            >
              개인정보처리방침
            </span>
            에 동의합니다.
          </label>
        </div>

        <button
          disabled={!checked}
          onClick={onAgree}
          className="w-full py-2 rounded-xl font-semibold text-white bg-pink-500 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-pink-600 transition"
        >
          동의하고 계속하기
        </button>
      </div>
    </div>
  );
};
