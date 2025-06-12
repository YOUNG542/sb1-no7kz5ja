import React from 'react';
import { Check, X, Clock, MessageCircle } from 'lucide-react';
import { MessageRequest, User } from '../types';

interface MessageRequestsProps {
  requests: MessageRequest[];
  users: User[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const MessageRequests: React.FC<MessageRequestsProps> = ({
  requests,
  users,
  onAccept,
  onReject
}) => {
  const pendingRequests = requests.filter(r => r.status === 'pending');
  
  const getUserById = (id: string) => users.find(u => u.id === id);
  
  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">메시지 요청</h1>
          <p className="text-gray-600">새로운 인연이 당신에게 관심을 보였어요!</p>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 메시지 요청이 없어요</h3>
            <p className="text-gray-600">프로필이 더 매력적으로 보이면 메시지가 올 거예요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const sender = getUserById(request.fromUserId);
              if (!sender) return null;

              return (
                <div key={request.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{sender.nickname}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(request.timestamp)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{sender.intro}</p>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-800 font-medium">"{request.message}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => onReject(request.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      거절하기
                    </button>
                    <button
                      onClick={() => onAccept(request.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-xl font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                    >
                      <Check className="w-4 h-4" />
                      수락하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};