// ComplaintPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ComplaintForm } from './ComplaintForm';

export const ComplaintPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">불만사항 제출</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-500 underline"
        >
          ← 돌아가기
        </button>
      </div>
      <ComplaintForm onBack={() => navigate(-1)} />
    </div>
  );
};