import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { User, Message } from '../types';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';

interface ChatRoomProps {
  roomId: string;
  currentUser: User;
  otherUser: User;
  onBack: () => void;
  onSendMessage: (content: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  currentUser,
  otherUser,
  onBack,
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          content: data.content,
          timestamp: data.createdAt?.toMillis?.() ?? Date.now(),
        };
      });
      setMessages(fetched);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // 키보드 올라올 때 입력창이 안 가려지게 자동 스크롤
    const handler = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);

    await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
      senderId: currentUser.id,
      content: message.trim(),
      createdAt: serverTimestamp(),
    });

    setMessage('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const parseTimestamp = (raw: any): number => {
    if (typeof raw === 'number') return raw;
    if (raw?.seconds) return raw.seconds * 1000;
    console.warn('❓ 잘못된 timestamp 형식:', raw);
    return Date.now();
  };

  const formatTime = (timestamp: any) => {
    const date = new Date(parseTimestamp(timestamp));
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (timestamp: any) => {
    const date = new Date(parseTimestamp(timestamp));
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return '오늘';
    if (date.toDateString() === yesterday.toDateString()) return '어제';
    return date.toLocaleDateString('ko-KR');
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const msgDate = formatDate(msg.timestamp);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
      {/* 상단 헤더 */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200 p-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{otherUser?.nickname || '❓ 닉네임 없음'}</h2>
          <p className="text-sm text-gray-600 truncate">{otherUser?.intro || ''}</p>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="text-center text-xs text-gray-500 py-2">{group.date}</div>
            {group.messages.map((msg, idx) => {
              if (!msg.id || typeof msg.content !== 'string' || typeof msg.senderId !== 'string' || !msg.timestamp) {
                console.warn(`❌ [${idx}] 누락된 필드 → 렌더링 제외`, msg);
                return null;
              }
              const isOwn = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                >
                  <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl break-words whitespace-pre-wrap ${
                        isOwn
                          ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 flex-shrink-0 w-full">
        <div className="flex gap-2 w-full items-end">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-sm"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 text-white p-3 rounded-xl font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
