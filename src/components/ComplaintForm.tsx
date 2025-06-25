import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

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
      <h2 className="text-xl font-bold mb-3">불만 및 건의사항 제출</h2>

      <p className="text-sm text-gray-600 mb-2">
        서비스 이용 중 불편했던 점이나 <span className="font-semibold">추가되었으면 하는 기능</span>이 있다면 자유롭게 작성해주세요.
      </p>

      <ul className="text-xs text-gray-500 mb-4 list-disc list-inside space-y-1">
        <li>💬 매칭이 너무 느려요</li>
        <li>📩 메시지를 더 많이 보내고 싶어요</li>
        <li>📱 차단 기능이 있었으면 좋겠어요</li>
        <li>🎨 프로필 꾸미기 기능이 있었으면 해요</li>
        <li>⚠️ 광고 노출 위치가 너무 눈에 띄어요</li>
        <li>🆕 신규 유저를 더 많이 추천받고 싶어요</li>
        <li>❓이 기능이 뭔지 잘 모르겠어요 (설명 부족)</li>
      </ul>

      <textarea
        className="w-full border rounded-lg p-2 mb-4 min-h-[120px]"
        placeholder="예: 매칭 상대가 너무 적어요. 또는 좋아요 버튼도 있었으면 좋겠어요."
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
