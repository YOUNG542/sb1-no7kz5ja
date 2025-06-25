import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ProfileModalProps {
  userId: string;
  onClose: () => void;
  onMessageRequest: (userId: string) => void; // ✅ 추가
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ userId, onClose, onMessageRequest }) => {
  const [user, setUser] = useState<{ nickname: string; intro?: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUser(snap.data() as { nickname: string; intro?: string });
      }
    };
    fetchUser();
  }, [userId]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-80">
        <h2 className="text-xl font-bold mb-2">{user.nickname}</h2>
        <p className="text-sm text-gray-700 mb-4">{user.intro || '자기소개가 없습니다.'}</p>

        <div className="flex justify-end space-x-2">
          {/* ✅ 메시지 요청 버튼 */}
          <button
            onClick={() => {
              onMessageRequest(userId);
              onClose(); // 요청 후 모달 닫기
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            메시지 요청
          </button>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
