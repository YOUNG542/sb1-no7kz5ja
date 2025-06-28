import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { User, Message } from '../types';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where, getDocs, writeBatch, doc, updateDoc } from 'firebase/firestore'; // updateDoc 임포트 추가
import { IcebreakerQuestion } from './IcebreakerQuestion';
import { getDoc, setDoc } from 'firebase/firestore'; // 추가
import { IcebreakerReveal } from './IcebreakerReveal';
import { deleteDoc } from 'firebase/firestore'; // 상단에 추가
interface ChatRoomProps {
  roomId: string;
  currentUser: User;
  otherUser: User;
  onBack: () => void;
  onSendMessage: (content: string) => void;
}

const resetUnreadCount = async (roomId: string, userId: string) => {
  const chatRoomRef = doc(db, 'chatRooms', roomId);
  await updateDoc(chatRoomRef, {
    [`unreadCounts.${userId}`]: 0,
  });
};

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
  const [showIcebreaker, setShowIcebreaker] = useState(false);
  const [icebreakerCompleted, setIcebreakerCompleted] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [myAnswers, setMyAnswers] = useState<string[]>([]);
  const [otherAnswers, setOtherAnswers] = useState<string[]>([]);
  const icebreakerQuestions = [
    '조금 실례되는 질문 해도 될까요?',
    '연애 몇 번 해보셨어요?',
    '원래 이렇게 꼬시는 편이에요?ㅋㅋ',
    '실연 당해본 적 있어요?',
    '혹시 바람… 핀 적 있으세요?',
    '소개팅 많이 해보셨어요?',
  ];

  
  useEffect(() => {
    const checkRevealReady = async () => {
      if (!roomId || !currentUser?.id || !otherUser?.id) return;
  
      const localKey = `icebreakerShown-${roomId}-${currentUser.id}`;
      const alreadySeen = localStorage.getItem(localKey);
      if (alreadySeen) return; // 🔒 이미 본 적 있으면 스킵
  
      const myRef = doc(db, 'chatRooms', roomId, 'icebreakerAnswers', currentUser.id);
      const otherRef = doc(db, 'chatRooms', roomId, 'icebreakerAnswers', otherUser.id);
  
      const [mySnap, otherSnap] = await Promise.all([
        getDoc(myRef),
        getDoc(otherRef)
      ]);
  
      if (mySnap.exists() && otherSnap.exists()) {
        const myData = mySnap.data();
        const otherData = otherSnap.data();
  
        setMyAnswers(myData.answers || []);
        setOtherAnswers(otherData.answers || []);
        setShowReveal(true);
        localStorage.setItem(localKey, 'true'); // ✅ 캐시 저장 → 재입장 시 미표시
      }
    };
  
    checkRevealReady();
  }, [roomId, currentUser?.id, otherUser?.id, icebreakerCompleted]);
  
  useEffect(() => {
    console.log('🧪 Icebreaker useEffect triggered', roomId, currentUser?.id);
  
    const checkIcebreaker = async () => {
      console.log('🧪 checkIcebreaker 시작');
  
      if (!roomId || !currentUser?.id) {
        console.log('❌ roomId 또는 currentUser.id 없음 → 종료');
        return;
      }
  
      const answerDocRef = doc(db, 'chatRooms', roomId, 'icebreakerAnswers', currentUser.id);
      const answerSnap = await getDoc(answerDocRef);
  
      if (!answerSnap.exists()) {
        console.log('✅ icebreakerAnswers 문서 없음 → 모달 보여줌');
        setShowIcebreaker(true);
      } else {
        console.log('🟡 이미 존재하는 문서 → 모달 생략');
      }
    };
  
    checkIcebreaker();
  }, [roomId, currentUser?.id]);
  

  useEffect(() => {
    if (!roomId) {
      console.warn('🚫 roomId가 아직 없습니다. 채팅방 구독 보류');
      return;
    }
  
    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));  // 'timestamp' 필드로 정렬
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp; // data에서 timestamp 필드를 가져오기
  
        return {
          id: doc.id,
          senderId: data.senderId,
          to: data.to,
          content: data.content,
          timestamp: timestamp && timestamp.toMillis ? timestamp.toMillis() : Date.now(),  // timestamp 처리
          isRead: data.isRead ?? false,
        } as Message;  // 명시적으로 타입 지정
      });
  
      setMessages(fetched);
    });
  
    return () => unsubscribe();
  }, [roomId]);
  
  
  

  useEffect(() => {
    if (!roomId || !currentUser?.id) return;

    const markMessagesAsRead = async () => {
      const q = query(
        collection(db, 'chatRooms', roomId, 'messages'),
        where('to', '==', currentUser.id),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((docSnap) => {
        const msgRef = doc(db, 'chatRooms', roomId, 'messages', docSnap.id);
        batch.update(msgRef, { isRead: true });
      });

      await batch.commit();
    };

    markMessagesAsRead();
  }, [roomId, currentUser?.id]);
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!roomId || !currentUser?.id) return;
    resetUnreadCount(roomId, currentUser.id);
  }, [roomId, currentUser?.id]);

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
  
    // Firestore에 메시지 저장
    await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
      senderId: currentUser.id,
      to: otherUser.id,
      isRead: false,
      content: message.trim(),
      timestamp: serverTimestamp(), 
    });
  
    // 해당 채팅방의 마지막 메시지 업데이트 (enrichedChatRooms 업데이트)
    const roomRef = doc(db, 'chatRooms', roomId);
    await updateDoc(roomRef, {
      lastMessage: {
        senderId: currentUser.id,
        content: message.trim(),
        timestamp: serverTimestamp(),
      },
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

  const handleIcebreakerComplete = async (answers: string[]) => {
    const answerDocRef = doc(db, 'chatRooms', roomId, 'icebreakerAnswers', currentUser.id);
    await setDoc(answerDocRef, {
      answers,
      completedAt: serverTimestamp(),
    });
  
    setIcebreakerCompleted(true);
    setShowIcebreaker(false);
  };

  const handleLeaveChatRoom = async () => {
    const confirmLeave = window.confirm('정말 이 채팅방을 나가시겠어요?\n대화 내용은 모두 사라집니다.');
    if (!confirmLeave) return;
  
    try {
      await deleteDoc(doc(db, 'chatRooms', roomId));
      onBack(); // 채팅방 리스트로 돌아감
    } catch (error) {
      console.error('❌ 채팅방 삭제 중 오류:', error);
      alert('채팅방을 나가는 데 실패했어요.');
    }
  };

  const handleSendIcebreaker = async () => {
    const roomRef = doc(db, 'chatRooms', roomId);
    const roomSnap = await getDoc(roomRef);
  
    let selectedQuestion = '';
  
    if (roomSnap.exists()) {
      const data = roomSnap.data();
      selectedQuestion = data.icebreakerQuestion;
    }
  
    if (!selectedQuestion) {
      selectedQuestion = icebreakerQuestions[Math.floor(Math.random() * icebreakerQuestions.length)];
      await updateDoc(roomRef, { icebreakerQuestion: selectedQuestion });
    }
  
    await addDoc(collection(db, 'chatRooms', roomId, 'messages'), {
      senderId: 'system',
      to: null,
      isRead: false,
      content: selectedQuestion,
      timestamp: serverTimestamp(),
    });
  };
  



  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-pink-50 via-orange-50 to-red-50">
      {showIcebreaker && (
  <IcebreakerQuestion onComplete={handleIcebreakerComplete} />
)}

{showReveal && (
  <IcebreakerReveal
    questions={[
      '당신의 이상형은 어떤 사람인가요?',
      '당신의 남/여자친구가 같은 학교 이성친구와 단 둘이 밥을 먹을 수 있나요?',
      '당신은 테토인가요, 에겐인가요? ㅎㅎ',
      '당신이 이성을 좋아할 때 꼭 하는 말이나 행동이 뭔가요?',
      '하루에 연락 몇 번 정도가 편하신가요?',
      '마지막으로 지금부터 얘기할 같은 학교 이성친구에게 하고 싶은 말은??'
    ]}
    myAnswers={myAnswers}
    otherAnswers={otherAnswers}
    otherNickname={otherUser.nickname}
    onClose={() => setShowReveal(false)}
  />
)}
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

        <button
    onClick={handleLeaveChatRoom}
    className="text-xs text-red-500 font-medium px-2 py-1 border border-red-200 rounded-lg hover:bg-red-50 transition ml-auto"
  >
    나가기
  </button>
      </div>

      {/* 아이스브레이킹 버튼 줄 */}
<div className="bg-white/90 backdrop-blur-lg px-4 pt-1 pb-2 flex gap-2 border-b border-gray-200">
  <button
    onClick={handleSendIcebreaker}
    className="text-sm bg-pink-100 text-pink-600 px-3 py-1 rounded-xl hover:bg-pink-200 transition"
  >
    ❄ 아이스브레이킹 질문
  </button>
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
                className={`flex ${
                  msg.senderId === 'system'
                    ? 'justify-center'
                    : isOwn
                    ? 'justify-end'
                    : 'justify-start'
                } mb-3`}
              >
                <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl break-words whitespace-pre-wrap ${
                      msg.senderId === 'system'
                        ? 'bg-gray-100 text-gray-700 text-sm italic'
                        : isOwn
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
              
                  {/* 시스템 메시지는 시간 숨김 */}
                  {msg.senderId !== 'system' && (
                    <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  )}
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
