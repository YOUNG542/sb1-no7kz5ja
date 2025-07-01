import React, { useState } from 'react';
import { Eye, MessageCircle, Clock } from 'lucide-react';
import { User } from '../types';
import AdBanner from './AdBanner';

interface ProfileCardProps {
  user: User & {
    matchingCount?: number;
    messageRequestCount?: number;
    isTopRequester?: boolean;
  };
  onReact: (userId: string, emoji: string) => void;
  onMessageRequest: (userId: string) => void;
  alreadyRequested: boolean;
  currentUserId: string;
}


export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  onReact,
  onMessageRequest,
  alreadyRequested,
  currentUserId
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showAd, setShowAd] = useState(false);



  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };



  const handleMessageRequest = () => {
    onMessageRequest(user.id);
    setShowAd(true);
  };



  const getGenderLabel = (gender: 'male' | 'female' | undefined) => {
    if (gender === 'male') return '👨 남성';
    if (gender === 'female') return '👩 여성';
    return '';
  };

  const getGenderBadgeClass = (gender: 'male' | 'female' | undefined) => {
    if (gender === 'male') return 'bg-blue-100 text-blue-600';
    if (gender === 'female') return 'bg-pink-100 text-pink-600';
    return 'bg-gray-100 text-gray-500';
  };

// ✅ JSX 밖에서 실행
console.log(`[DEBUG] ${user.nickname}: matchingCount =`, user.matchingCount);


  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
        isHovered ? 'transform-gpu' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
  <h3 className="text-xl font-bold text-gray-900">{user.nickname}</h3>
  <div className="flex items-center gap-2">

  

    {/* 성별 뱃지 */}
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getGenderBadgeClass(user.gender)}`}>
      {getGenderLabel(user.gender)}
    </span>

    {user.gender === 'female' && (user.matchingCount ?? 0) >= 1 && (
  <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
    응답률 높음 🔥 {user.matchingCount}회 수락
  </div>
)}

    {/* ✅ 상위 10% 뱃지 삽입 위치 */}
    {user.isTopRequester && (
      <div className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
        상위 10% 🔺
      </div>
    )}
  </div>
</div>

          <p className="text-gray-700 leading-relaxed">{user.intro}</p>
        </div>
      
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getTimeAgo(user.createdAt.toDate().getTime())}
        </div>
        
      </div>

      <div className="flex items-center justify-between">
      

      <button
  onClick={handleMessageRequest}
  disabled={alreadyRequested}
  className={`min-w-[120px] px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 text-sm transition-all duration-200 ${
    alreadyRequested
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:from-pink-600 hover:to-red-600'
  }`}
>
  <MessageCircle className="w-4 h-4" />
  {alreadyRequested ? '요청 완료' : '메시지'}
</button>
      </div>

      {showAd && (
        <div className="mt-6">
          <AdBanner />
        </div>
      )}
    </div>
  );
};
