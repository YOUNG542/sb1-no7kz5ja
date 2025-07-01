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
  const [interests, setInterests] = useState<string[]>([]);
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
        setInterests(data.interests || []);
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
        interests,
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

         {/* ✅ 관심사 선택 */}
         <label className="block text-sm font-medium mb-1 mt-4">관심사 (최대 5개)</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          '전시회', '영화감상', '드로잉/그림', '사진 찍기', '글쓰기/에세이', '독서',
          'K-POP', '인디음악', '힙합', '재즈/클래식', '유튜브 보기', '넷플릭스/OTT',
          '카페 투어', '빵/디저트', '라멘/면 요리', '혼밥/혼술', '요리/베이킹',
          '헬스/웨이트', '필라테스/요가', '등산/걷기', '러닝', '패션/쇼핑', '홈카페/홈꾸미기',
          '국내 여행', '해외 여행', '당일치기 나들이', '힐링 여행', '혼자 여행',
          '밸런스 게임', '보드게임', '롤/오버워치 등 게임', '노래방/코인노래방', '타로/MBTI/혈액형',
          'MBTI 이야기 좋아함', '연애/썸 이야기 좋아함', '고민 상담 들어주는 거 좋아함',
          '감정 토로하기 좋아함', '아무 말 대잔치 스타일'
        ].map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => {
              const newInterests = interests.includes(interest)
                ? interests.filter((i) => i !== interest)
                : interests.length < 5
                  ? [...interests, interest]
                  : interests;
              setInterests(newInterests);
            }}
            className={`px-3 py-1 rounded-full border text-sm ${
              interests.includes(interest)
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-pink-400'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>

      {interests.length === 5 && (
        <p className="text-xs text-gray-500 mb-2">최대 5개까지 선택할 수 있어요.</p>
      )}


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
