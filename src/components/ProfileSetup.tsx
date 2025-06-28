import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { User } from '../types';
import { Timestamp } from 'firebase/firestore';

interface ProfileSetupProps {
  uid: string;
  onComplete: (user: User) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ uid, onComplete }) => {
  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>(''); // 🔥 성별 상태 추가
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!nickname.trim() || !intro.trim() || !gender) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newUser: User = {
      id: uid,
      nickname: nickname.trim(),
      intro: intro.trim(),
      gender, // 🔥 성별 저장
      createdAt: Timestamp.fromDate(new Date()),
      reactions: {},
      messageRequestCount: 0
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

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={!nickname.trim() || !intro.trim() || !gender || isLoading}
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
