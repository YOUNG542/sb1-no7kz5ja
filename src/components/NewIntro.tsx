// src/components/NewIntro.tsx
import React, { useEffect } from 'react';

interface Props {
  onFinish: () => void;
}

export const NewIntro: React.FC<Props> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // 1.5초 후 자동 넘어감
    }, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center px-6">
      <h1 className="text-2xl font-bold mb-4 text-pink-600">👋 환영합니다!</h1>
      <p className="text-gray-600 text-sm">다시 오신 걸 환영해요.<br /> 새로운 연결이 기다리고 있어요.</p>
    </div>
  );
};
