// ProfileScreen.tsx (리팩토링 버전)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useEffect, useState } from 'react';
import { UserCircle, Pencil, AlertCircle, Info } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'; // 필요한 경우 직접 구현 가능
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';

export const ProfileScreen: React.FC = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [loading, setLoading] = useState(true);
  const [photoURL, setPhotoURL] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

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
        setPhotoURL(data.photoURL || '');
        setInterests(data.interests || []); // 🔥 추가
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-4 text-center">불러오는 중...</div>;

  return (
    <div className="min-h-screen flex items-start justify-center pt-20">
      <div className="p-6 max-w-md w-full relative">
        
        {/* ✅ 우측 상단 아이콘 그룹 */}
        <div className="absolute top-4 right-4 flex gap-3 items-center">
          {/* 불만사항 아이콘 */}
          <button
            className="text-yellow-500 hover:text-yellow-600"
            onClick={() => navigate('/complaint')}
          >
            <AlertCircle size={24} />
          </button>
  
          {/* 약관 아이콘 - 팝오버 메뉴 */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <Info size={24} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              className="bg-white border border-gray-200 rounded-md shadow-lg p-2 w-48"
            >
              <div className="flex flex-col text-sm text-gray-700">
                <button
                  onClick={() => navigate('/terms-of-service')}
                  className="text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                >
                  📄 이용약관
                </button>
                <button
                  onClick={() => navigate('/privacy-policy')}
                  className="text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                >
                  🔒 개인정보처리방침
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
  
    
        {/* 프로필 사진 */}
<div className="flex flex-col items-center mb-6">
  <label
    htmlFor="photo-upload"
    className="cursor-pointer w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-pink-300 hover:border-pink-500 transition-all duration-200 bg-gray-100 flex items-center justify-center"
  >
    {photoURL ? (
      <img
        src={photoURL}
        alt="Profile"
        className="object-cover w-full h-full"
      />
    ) : (
      <UserCircle size={56} className="text-gray-400" />
    )}
  </label>
  <input
    id="photo-upload"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={async (e) => {
      if (!user || !e.target.files?.[0]) return;
      const file = e.target.files[0];

      const storage = getStorage();
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });
      setPhotoURL(downloadURL);
    }}
  />
  <p className="text-sm text-gray-400 mt-2">사진을 눌러 변경할 수 있어요</p>
</div>

  
        {/* 닉네임 + 성별 + 수정 */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-xl font-bold">{nickname}</h2>
          <span className="text-pink-500">
            {gender === 'male' ? '♂' : gender === 'female' ? '♀' : ''}
          </span>
          <button
            onClick={() => navigate('/edit-profile')}
            className="text-gray-400 hover:text-gray-600"
          >
            <Pencil size={18} />
          </button>
        </div>
  
        {/* 한 줄 소개 */}
        <p className="text-center text-base text-gray-700 font-normal mb-6">
          {intro || '아직 소개글이 없어요!'}
        </p>

        {/* 관심사 선택 */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    관심사 (최대 5개 선택)
  </label>
  <div className="flex flex-wrap gap-2">
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
        onClick={async () => {
          if (!user) return;
          const newInterests = interests.includes(interest)
            ? interests.filter((i) => i !== interest)
            : interests.length < 5
              ? [...interests, interest]
              : interests;

          setInterests(newInterests);
          await updateDoc(doc(db, 'users', user.uid), { interests: newInterests });
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
    <p className="text-xs text-gray-500 mt-1">최대 5개까지 선택할 수 있어요.</p>
  )}
</div>
  
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
    </div>
  );
  
  
};