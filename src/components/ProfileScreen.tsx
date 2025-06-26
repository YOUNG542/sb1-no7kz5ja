// ProfileScreen.tsx (리팩토링 버전)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useEffect, useState } from 'react';
import { UserCircle, Pencil, AlertCircle } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNickname(data.nickname || '');
        setIntro(data.intro || '');
        setGender(data.gender || '');
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-4 text-center">불러오는 중...</div>;

  return (
    <div className="p-4 max-w-md mx-auto relative">
      {/* 불만사항 아이콘 */}
      <button
        className="absolute top-4 right-4 text-yellow-500 hover:text-yellow-600"
        onClick={() => navigate('/complaint')}
      >
        <AlertCircle size={24} />
      </button>

      {/* ⏬ 이렇게 바꿔주세요 */}
<div className="flex flex-col items-center mb-4">
  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
    <UserCircle size={40} className="text-gray-400" />
  </div>
  <p className="text-xs text-gray-400 mt-2">프로필 사진 기능은 준비 중이에요 🙏</p>
</div>
      {/* 닉네임 + 성별 아이콘 + 수정 버튼 */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <h2 className="text-xl font-bold">{nickname}</h2>
        <span className="text-pink-500">{gender === 'male' ? '♂' : gender === 'female' ? '♀' : ''}</span>
        <button
          onClick={() => navigate('/edit-profile')}
          className="text-gray-400 hover:text-gray-600"
        >
          <Pencil size={18} />
        </button>
      </div>

      {/* 한줄 소개 */}
      <p className="text-center text-gray-500 text-sm mb-6">{intro || '소개글이 없습니다.'}</p>

      {/* 내가 쓴 글 보기 */}
      <div className="flex justify-center">
        <button
          className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-pink-600"
          onClick={() => navigate('/my-posts')}
        >
          내가 쓴 글 보기
        </button>
      </div>
    </div>
  );
};