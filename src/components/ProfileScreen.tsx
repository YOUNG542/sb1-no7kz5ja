import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';

export const ProfileScreen: React.FC = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
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
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nickname,
        intro,
      });
      setMessage('닉네임과 한 줄 소개가 성공적으로 변경되었습니다!');
    } catch (error) {
      console.error(error);
      setMessage('❌ 저장 실패. 다시 시도해주세요.');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const confirmDelete = window.confirm('정말로 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      alert('사용자 정보가 삭제되었습니다. 앱을 종료합니다.');
      window.close(); // 일부 브라우저에서는 동작하지 않을 수 있음
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('❌ 삭제 중 문제가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-4 text-center">불러오는 중...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">프로필 수정</h2>

      <label className="block text-sm font-medium mb-1">닉네임</label>
      <input
        className="w-full border rounded-lg p-2 mb-4"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={20}
        placeholder="닉네임을 입력하세요"
      />

      <label className="block text-sm font-medium mb-1">한 줄 소개</label>
      <input
        className="w-full border rounded-lg p-2 mb-4"
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        maxLength={50}
        placeholder="한 줄 소개를 입력하세요"
      />

      <button
        className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition"
        onClick={handleSave}
      >
        저장하기
      </button>

      <button
        className="w-full mt-3 bg-gray-300 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
        onClick={handleDelete}
      >
        정보 삭제
      </button>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
};
