import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { MessageSquare, Clock, RefreshCcw } from 'lucide-react';
import { db } from '../firebase/config';
import { ChatRoom, User, Message } from '../types';
import { Timestamp } from 'firebase/firestore';

interface ChatListProps {
  users: User[];
  currentUserId: string;
  onSelectChat: (roomId: string) => void;
  enrichedChatRooms: {
    [roomId: string]: {
      lastMessage?: Message;
      unreadCount: number;
    };
  };
  setEnrichedChatRooms: React.Dispatch<React.SetStateAction<any>>; // setEnrichedChatRooms 전달 받기
}

export const ChatList: React.FC<ChatListProps> = ({
  users,
  currentUserId,
  onSelectChat,
  enrichedChatRooms,
  setEnrichedChatRooms,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRoomClick = (roomId: string) => {
    try {
      onSelectChat(roomId);
    } catch (error) {
      alert('⚠️ 채팅방에 들어갈 수 없습니다. 새로고침 후 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    const roomsRef = collection(db, 'chatRooms');
  
    const unsubscribe = onSnapshot(roomsRef, (snapshot: QuerySnapshot) => {
      const updatedChatRooms: any = {};
  
      snapshot.forEach((doc: DocumentSnapshot) => {
        const roomData = doc.data();
        if (!roomData) return;
  
        const lastMessageRef = collection(db, 'chatRooms', doc.id, 'messages');
        const latestMessageQuery = query(lastMessageRef, orderBy('timestamp', 'desc'), limit(1));
  
        onSnapshot(latestMessageQuery, (messageSnapshot: QuerySnapshot) => {
          const lastMessageDoc = messageSnapshot.docs[0];
          const lastMessage = lastMessageDoc ? lastMessageDoc.data() : null;
  
          updatedChatRooms[doc.id] = {
            lastMessage: lastMessage,
            unreadCount: roomData.unreadCount || 0,
          };
  
          setEnrichedChatRooms((prevState: any) => ({
            ...prevState, // 이전 상태 유지
            [doc.id]: updatedChatRooms[doc.id], // 현재 방에 대한 업데이트만 반영
          }));
        });
      });
  
      return () => unsubscribe();
    });
  
    return () => unsubscribe();
  }, [currentUserId, setEnrichedChatRooms]);
  
  const sortedRoomIds = Object.keys(enrichedChatRooms).sort((a, b) => {
    const aTime = enrichedChatRooms[a].lastMessage?.timestamp ?? 0;
    const bTime = enrichedChatRooms[b].lastMessage?.timestamp ?? 0;
    return bTime - aTime;
  });
 

  const getUserById = (id: string) => users.find(u => u.id === id);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-red-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">채팅</h1>
          <p className="text-gray-600">새로운 인연들과 대화해보세요</p>
        </div>

        {sortedRoomIds.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 진행 중인 채팅이 없어요</h3>
            <p className="text-gray-600 mb-2">
              메시지 요청을 수락하면 채팅을 시작할 수 있어요!
            </p>
            <p className="text-sm text-red-500 mb-4">
              ※ 채팅방이 열리지 않거나 들어가지지 않는 경우, 아래 버튼을 눌러 새로고침 해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-xl transition-all"
              disabled={isRefreshing}
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRoomIds.map((roomId) => {
              const roomInfo = enrichedChatRooms[roomId];
              const lastMessage = roomInfo.lastMessage;
              const unreadCount = roomInfo.unreadCount;
              const room = { id: roomId }; // 최소한의 방 정보
              const otherUserId =
                lastMessage?.senderId === currentUserId ? lastMessage?.to : lastMessage?.senderId;
              const otherUser = getUserById(otherUserId || '');

              if (!otherUser) return null;

              return (
                <button
                  key={roomId}
                  onClick={() => handleRoomClick(roomId)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{otherUser.nickname}</h3>
                    {lastMessage && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(lastMessage.timestamp || 0)}
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

                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-500 text-white rounded-full px-2 mt-1 inline-block">
                       안 읽음 {unreadCount}
                    </span>
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
