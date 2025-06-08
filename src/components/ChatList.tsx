import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { ChatRoom, User, Message } from '../types';

interface ChatListProps {
  chatRooms: ChatRoom[];
  users: User[];
  currentUserId: string;
  onSelectChat: (roomId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chatRooms,
  users,
  currentUserId,
  onSelectChat
}) => {
  const getUserById = (id: string) => users.find(u => u.id === id);
  
  const getOtherParticipant = (room: ChatRoom) => {
    const otherId = room.participants.find(id => id !== currentUserId);
    return otherId ? getUserById(otherId) : null;
  };

  const getLastMessage = (room: ChatRoom): Message | null => {
    return room.messages.length > 0 
      ? room.messages[room.messages.length - 1]
      : null;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  const sortedRooms = [...chatRooms].sort((a, b) => {
    const aLastMsg = getLastMessage(a);
    const bLastMsg = getLastMessage(b);
    const aTime = aLastMsg?.timestamp || a.createdAt;
    const bTime = bLastMsg?.timestamp || b.createdAt;
    return bTime - aTime;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">채팅</h1>
          <p className="text-gray-600">새로운 인연들과 대화해보세요</p>
        </div>

        {sortedRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 진행 중인 채팅이 없어요</h3>
            <p className="text-gray-600">메시지 요청을 수락하면 채팅을 시작할 수 있어요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRooms.map((room) => {
              const otherUser = getOtherParticipant(room);
              const lastMessage = getLastMessage(room);
              
              if (!otherUser) return null;

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectChat(room.id)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{otherUser.nickname}</h3>
                    {lastMessage && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(lastMessage.timestamp)}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{otherUser.intro}</p>
                  
                  {lastMessage ? (
                    <p className="text-sm text-gray-800 truncate">
                      {lastMessage.senderId === currentUserId ? '나: ' : ''}
                      {lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">대화를 시작해보세요!</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};