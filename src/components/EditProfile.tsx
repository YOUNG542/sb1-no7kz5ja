// EditProfile.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const EditProfile: React.FC = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNickname(data.nickname || '');
        setIntro(data.intro || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nickname,
        intro,
      });
      setMessage('✅ 저장 완료!');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (error) {
      console.error(error);
      setMessage('❌ 저장 실패');
    }
  };

  if (loading) return <div className="p-4 text-center">불러오는 중...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">프로필 수정</h2>

      <label className="block text-sm font-medium mb-1">닉네임</label>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full border rounded-lg p-2 mb-4"
        maxLength={20}
        placeholder="닉네임 입력"
      />

      <label className="block text-sm font-medium mb-1">한 줄 소개</label>
      <input
        type="text"
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        className="w-full border rounded-lg p-2 mb-4"
        maxLength={50}
        placeholder="소개글 입력"
      />

      <button
        onClick={handleSave}
        className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600"
      >
        저장하기
      </button>

      {message && <p className="mt-3 text-sm text-center">{message}</p>}
    </div>
  );
};
