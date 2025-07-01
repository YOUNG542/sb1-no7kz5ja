import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { User } from '../types';
import { Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProfileSetupProps {
  uid: string;
  onComplete: (user: User) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ uid, onComplete }) => {
  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>(''); // 🔥 성별 상태 추가
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const storage = getStorage(); // 🔥 Firebase 초기화된 앱 기준

const [photoURL, setPhotoURL] = useState('');
const [interests, setInterests] = useState<string[]>([]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!nickname.trim() || !intro.trim() || !gender) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

// Firebase Storage에 이미지 업로드
let uploadedPhotoURL = '';
if (photo) {
  const storageRef = ref(storage, `profilePhotos/${uid}`);
  await uploadBytes(storageRef, photo);
  uploadedPhotoURL = await getDownloadURL(storageRef);
}

    // 유저 생성
const newUser: User = {
  id: uid,
  nickname: nickname.trim(),
  intro: intro.trim(),
  gender,
  photoURL: uploadedPhotoURL,
  interests, // 🔥 관심사 배열
  createdAt: Timestamp.fromDate(new Date()),
  reactions: {},
  messageRequestCount: 0,
  termsAccepted: {
    privacy: true,
    tos: true,
    timestamp: Timestamp.fromDate(new Date())
  }
};

    onComplete(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">네버엔딩 홍개팅</h1>
          <p className="text-gray-600">새로운 인연을 만나보세요</p>
        </div>


{/* 프로필 사진 업로드 */}
{/* 프로필 사진 업로드 */}
<div className="mb-6 text-center">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    프로필 사진 업로드 (얼굴 사진이 아니어도 돼요!)
  </label>
  <div className="flex flex-col items-center justify-center">
    <label
      htmlFor="photo-upload"
      className="cursor-pointer w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-pink-300 hover:border-pink-500 transition-all duration-200 bg-gray-100 flex items-center justify-center"
    >
      {photo ? (
        <img
          src={URL.createObjectURL(photo)}
          alt="Preview"
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-gray-400 text-sm">사진 선택</span>
      )}
    </label>
    <input
      id="photo-upload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          setPhoto(e.target.files[0]);
        }
      }}
      disabled={isLoading}
    />
    {photo && (
      <p className="text-xs text-gray-500 mt-2">{photo.name}</p>
    )}
  </div>
</div>


        <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20 backdrop-blur-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="어떻게 불러드릴까요?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 font-medium"
                disabled={isLoading}
                required
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {nickname.length}/20
              </div>
            </div>

            {/* 한줄소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                한 줄 소개
              </label>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                maxLength={100}
                placeholder="자신을 한 줄로 표현해보세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 font-medium resize-none"
                rows={3}
                disabled={isLoading}
                required
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {intro.length}/100
              </div>
            </div>




            {/* 성별 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별
              </label>
              <div className="flex gap-3">
                {[
                  { label: '남자', value: 'male' },
                  { label: '여자', value: 'female' }
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGender(value as 'male' | 'female')}
                    className={`w-full py-2 rounded-xl font-semibold border transition-all duration-200 ${
                      gender === value
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                    }`}
                    disabled={isLoading}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {gender === '' && (
                <p className="text-xs text-red-500 mt-1">성별을 선택해주세요</p>
              )}
            </div>

            {/* 관심사 선택 */}
<div>
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
        onClick={() => {
          setInterests((prev) =>
            prev.includes(interest)
              ? prev.filter((i) => i !== interest)
              : prev.length < 5
                ? [...prev, interest]
                : prev
          );
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



 {/* 🔥 약관 동의 영역 (스크롤형) */}
<div className="text-xs text-gray-600">
  <p className="mb-2">서비스 이용을 위해 아래 약관을 읽고 동의해 주세요.</p>

  <div className="h-48 overflow-y-auto text-xs border p-3 rounded-md text-gray-700 bg-gray-50 mb-3">
    <p className="font-bold mb-1">[이용약관 요약]</p>
    <p>
      네버엔딩 홍개팅은 홍익대학교 소속 사용자 간 익명 기반 소개팅 및 커뮤니티 기능을 제공합니다. <br />
      사용자는 타인에게 불쾌감을 주는 언행, 성적 표현, 도배, 도용 행위를 해서는 안 됩니다. <br />
      위반 시 경고 없이 계정이 차단될 수 있으며, 사용자가 작성한 포스트 및 댓글 등은 
      서비스 내 비영리적 범위에서 활용될 수 있습니다. <br />
      운영자는 건전한 커뮤니티 유지를 위해 콘텐츠를 모니터링할 수 있으며, 사용자 간 매칭 및 대화에 대한 직접적인 책임은 지지 않습니다.
    </p>

    <p className="mt-3 font-bold">[개인정보처리방침 요약]</p>
    <p>
    서비스는 이름, 나이 등 법적 개인정보를 수집하지 않으며, 닉네임, 한줄소개, 성별, (추후 프로필 사진) 등 최소한의 익명 프로필 정보만 수집됩니다. <br />
메시지 내역, 포스트, 리액션 기록은 매칭 및 커뮤니케이션 기능 제공을 위해 저장되며, 계정 삭제 시 사용자 식별 정보(nickname 등)는 제거되지만 콘텐츠는 비식별화된 형태로 일부 유지될 수 있습니다. <br />
제3자에게 개인정보를 제공하지 않으며, 광고 플랫폼과도 연결되어 있지 않습니다.
    </p>
  </div>

  <div className="flex items-start gap-2 mb-1">
    <input
      type="checkbox"
      id="agreeTerms"
      checked={agreeTerms}
      onChange={(e) => setAgreeTerms(e.target.checked)}
      className="mt-1"
      disabled={isLoading}
    />
    <label htmlFor="agreeTerms" className="text-sm">
      위 약관과 개인정보처리방침에 동의합니다.
    </label>
  </div>
</div>


            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={!nickname.trim() || !intro.trim() || !gender || !agreeTerms || isLoading}

              className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  시작하기
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>💡 닉네임과 한 줄 소개, 성별 선택만으로 새로운 인연을 만나보세요</p>
          </div>
        </div>
      </div>
    </div>
  );
};
