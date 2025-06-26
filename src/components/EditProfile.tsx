import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      console.error(error);
      setMessage('❌ 저장 실패');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const confirmDelete = window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      alert('계정이 삭제되었습니다. 앱을 종료합니다.');
      window.close(); // 또는 navigate('/') 등 처리 가능
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('❌ 삭제 중 문제가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-4 text-center">불러오는 중...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* 돌아가기 버튼 */}
      <button onClick={() => navigate(-1)} className="text-sm text-blue-500 underline mb-4">
  ← 돌아가기
</button>

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

      <button
        onClick={handleDelete}
        className="mt-6 w-full bg-gray-100 text-red-500 py-2 rounded-lg font-semibold hover:bg-red-200"
      >
        계정 삭제하기
      </button>
    </div>
  );
};
