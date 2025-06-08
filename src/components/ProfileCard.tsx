import React, { useState } from 'react';
import { Heart, Eye, MessageCircle, Clock } from 'lucide-react';
import { User } from '../types';

interface ProfileCardProps {
  user: User;
  onReact: (userId: string, emoji: string) => void;
  onMessageRequest: (userId: string) => void;
  currentUserId: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  user, 
  onReact, 
  onMessageRequest, 
  currentUserId 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const reactions = ['❤️', '👀', '😊', '🔥', '✨'];
  
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  const handleReaction = (emoji: string) => {
    setSelectedEmoji(emoji);
    onReact(user.id, emoji);
    setTimeout(() => setSelectedEmoji(null), 600);
  };

  const getReactionCount = (emoji: string) => {
    return user.reactions[emoji]?.length || 0;
  };

  const hasUserReacted = (emoji: string) => {
    return user.reactions[emoji]?.includes(currentUserId) || false;
  };

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
          <h3 className="text-xl font-bold text-gray-900 mb-2">{user.nickname}</h3>
          <p className="text-gray-700 leading-relaxed">{user.intro}</p>
        </div>
        {user.messageRequestCount > 0 && (
          <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
            <MessageCircle className="w-3 h-3" />
            {user.messageRequestCount}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {getTimeAgo(user.createdAt)}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          관심 {Object.values(user.reactions).flat().length}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {reactions.map((emoji) => {
            const count = getReactionCount(emoji);
            const userReacted = hasUserReacted(emoji);
            
            return (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all duration-200 ${
                  userReacted 
                    ? 'bg-pink-100 text-pink-600 scale-110' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                } ${selectedEmoji === emoji ? 'animate-bounce' : ''}`}
              >
                <span className="text-base">{emoji}</span>
                {count > 0 && <span className="text-xs font-medium">{count}</span>}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onMessageRequest(user.id)}
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-xl font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2 text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          메시지
        </button>
      </div>
    </div>
  );
};