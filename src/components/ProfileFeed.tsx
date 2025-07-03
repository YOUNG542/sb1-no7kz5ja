import React, { useState } from 'react';
import { RefreshCw, Filter, Users } from 'lucide-react';
import { ProfileCard } from './ProfileCard';
import { User, MessageRequest, ChatRoom } from '../types';

interface ProfileFeedProps {
  users: User[];
  currentUser: User;
  messageRequests: MessageRequest[];
  acceptedRequests: MessageRequest[];
  chatRooms: ChatRoom[];
  onReact: (userId: string, emoji: string) => void;
  onMessageRequest: (userId: string) => void;
  onRefresh: () => void;
}

export const ProfileFeed: React.FC<ProfileFeedProps> = ({
  users,
  currentUser,
  messageRequests,
  chatRooms,
  acceptedRequests,
  onReact,
  onMessageRequest,
  onRefresh
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh();
    setIsRefreshing(false);
  };

  // ✅ (1) 유저별 메시지 요청 수 계산 (여자가 보는 남자 리스트용)
  const userRequestCountMap: Record<string, number> = {};
  if (currentUser.gender === 'female') {
    users.forEach((user) => {
      if (user.gender === 'male') {
        const count = messageRequests.filter(
          (req) => req.fromUserId === user.id
        ).length;
        userRequestCountMap[user.id] = count;
      }
    });
  }

  // ✅ (2) 유저별 매칭 경험 수 계산 (남자가 보는 여자 리스트용)
  const userMatchingCountMap: Record<string, number> = {};

if (currentUser.gender === 'male') {
  users.forEach((user) => {
    if (user.gender === 'female') {
      const matchedCount = acceptedRequests.filter(
        (req: MessageRequest) => req.toUserId === user.id
      ).length;
      userMatchingCountMap[user.id] = matchedCount;
    }
  });
}


  
  

  // ✅ 상위 10% 요청자 계산
let topUserIds: string[] = [];

if (currentUser.gender === 'female') {
  const sortedUserIds = Object.entries(userRequestCountMap)
    .sort(([, a], [, b]) => b - a)
    .map(([userId]) => userId);

  const topCount = Math.max(1, Math.floor(sortedUserIds.length * 0.1)); // 최소 1명은 표시
  topUserIds = sortedUserIds.slice(0, topCount);
}

// ✅ 유저별 응답률 계산
const userResponseMap: Record<string, { accepted: number; total: number; rate: number }> = {};

users.forEach((user) => {
  const receivedRequests = messageRequests.filter(
    (req) => req.toUserId === user.id
  );
  const accepted = receivedRequests.filter((r) => r.status === 'accepted').length;
  const rate = receivedRequests.length > 0 ? accepted / receivedRequests.length : 0;

  userResponseMap[user.id] = {
    accepted,
    total: receivedRequests.length,
    rate,
  };
});


  // ✅ (3) 필터링 및 정렬
  const filteredUsers = users
    .filter(user => {
      if (user.id === currentUser.id) return false;
      if (!user.gender || !currentUser.gender) return false;
      if (user.gender === currentUser.gender) return false;
      return true;
    })
    .map(user => ({
      ...user,
      responseRate: userResponseMap[user.id]?.rate ?? 0,
      isHighResponder:
  currentUser.gender === 'male' &&
  (userMatchingCountMap[user.id] || 0) >= 1,
    
      messageRequestCount: userRequestCountMap[user.id] || 0,
      matchingCount: userMatchingCountMap[user.id] || 0, // ← 요게 핵심
      isTopRequester: topUserIds.includes(user.id),
    }))
    .sort((a, b) => {
     // ⚡ 응답률 높은 유저 우선
   // ✅ 응답률 높은 유저가 먼저 오도록
   if (a.isHighResponder && !b.isHighResponder) return -1;
   if (!a.isHighResponder && b.isHighResponder) return 1;
 
  // 기존 성별별 정렬 유지
  if (currentUser.gender === 'female') {
    return (b.messageRequestCount || 0) - (a.messageRequestCount || 0);
  }
  if (currentUser.gender === 'male') {
    return (b.matchingCount || 0) - (a.matchingCount || 0);
  }

  if (sortBy === 'newest') {
    return b.createdAt.toMillis() - a.createdAt.toMillis();
  } else {
    const aPopularity = Object.values(a.reactions).flat().length;
    const bPopularity = Object.values(b.reactions).flat().length;
    return bPopularity - aPopularity;
  }
})
    




  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
      <div className="max-w-2xl mx-auto p-4">

        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {currentUser.nickname}님!</h1>
              <p className="text-gray-600">새로운 인연을 찾아보세요</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{filteredUsers.length}명의 새로운 친구들</span>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="newest">최신순</option>
                <option value="popular">인기순</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 아무도 없어요</h3>
              <p className="text-gray-600">새로고침을 눌러 새로운 친구들을 찾아보세요!</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const alreadyRequested = messageRequests.some(
                (req: MessageRequest) =>
                  req.fromUserId === currentUser.id &&
                  req.toUserId === user.id
              );
              
              return (
                <ProfileCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUser.id}
                  onReact={onReact}
                  onMessageRequest={onMessageRequest}
                  alreadyRequested={alreadyRequested}
                />
              );
            })
          )}
        </div>

        {/* Load more */}
        {filteredUsers.length > 0 && (
          <div className="text-center py-8">
            <button
              onClick={handleRefresh}
              className="text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium"
            >
              새로고침
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
