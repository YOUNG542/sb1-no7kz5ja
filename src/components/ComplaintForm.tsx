// components/ComplaintForm.tsx
import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';


// 🔥 여기에서 props 선언
interface ComplaintFormProps {
    onBack: () => void;
  }

  export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onBack }) => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async () => {
    if (!content.trim()) {
      setMessage('⚠️ 내용을 입력해주세요.');
      return;
    }

    if (!user) {
      setMessage('❌ 로그인이 필요합니다.');
      return;
    }

    try {
      await addDoc(collection(db, 'complaints'), {
        userId: user.uid,
        content,
        timestamp: Timestamp.now(),
      });
      setContent('');
      setMessage('✅ 불만사항이 성공적으로 제출되었습니다.');
    } catch (error) {
      console.error('불만사항 제출 실패:', error);
      setMessage('❌ 제출 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">불만사항 제출</h2>
      <textarea
        className="w-full border rounded-lg p-2 mb-4 min-h-[120px]"
        placeholder="불편한 점이나 개선 요청을 자유롭게 남겨주세요."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition"
      >
        제출하기
      </button>
      <button
        onClick={onBack}
        className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
      >
        돌아가기
      </button>
      {message && <p className="mt-3 text-sm text-center">{message}</p>}
    </div>
  );
};
