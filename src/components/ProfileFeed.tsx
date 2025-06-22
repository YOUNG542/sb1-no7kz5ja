import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, Users } from 'lucide-react';
import { ProfileCard } from './ProfileCard';
import { User } from '../types';

interface ProfileFeedProps {
  users: User[];
  currentUser: User;
  onReact: (userId: string, emoji: string) => void;
  onMessageRequest: (userId: string) => void;
  onRefresh: () => void;
}

export const ProfileFeed: React.FC<ProfileFeedProps> = ({
  users,
  currentUser,
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

  const filteredUsers = users
    .filter(user => user.id !== currentUser.id)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      } else {
        const aPopularity = Object.values(a.reactions).flat().length;
        const bPopularity = Object.values(b.reactions).flat().length;
        return bPopularity - aPopularity;
      }
    });

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
            filteredUsers.map((user) => (
              <ProfileCard
                key={user.id}
                user={user}
                currentUserId={currentUser.id}
                onReact={onReact}
                onMessageRequest={onMessageRequest}
              />
            ))
          )}
        </div>

        {/* Load more simulation */}
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