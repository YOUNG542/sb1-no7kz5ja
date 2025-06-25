declare global {
  interface Navigator {
    standalone?: boolean;
  }
}
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { trackDAU } from './components/trackDAU';
import { Timestamp } from 'firebase/firestore'; 
import { ProfileScreen } from './components/ProfileScreen'; // ✅ 추가
import { getCountFromServer } from 'firebase/firestore'; // 🔥 총 개수 계산용
import { getDAUForDates } from './components/checkDAU';
import { BackgroundAura } from './components/BackgroundAura';
import { limit, orderBy } from 'firebase/firestore';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { ProfileSetup } from './components/ProfileSetup';
import { ProfileFeed } from './components/ProfileFeed';
import { MessageRequests } from './components/MessageRequests';
import { ChatList } from './components/ChatList';
import { ChatRoom } from './components/ChatRoom';
import { MessageRequestModal } from './components/MessageRequestModal';
import { BottomNavigation } from './components/BottomNavigation';
import { PwaPrompt } from './components/pwa'; // ✅ 추가된 부분
import { Intro } from './components/intro';
import {
  User,
  MessageRequest,
  ChatRoom as ChatRoomType,
  Screen,
  Message,
} from './types';
import { initAnonymousAuth } from './firebase/auth';
import {
  saveUser,
  updateUser,
  getUserById,
  getAllUsers,
  saveMessageRequest,
  updateMessageRequest,
  subscribeToMessageRequestsForUser,
  saveChatRoom,
  updateChatRoom,
  getChatRoomsForUser,
} from './firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import GenderNoticeModal from './components/GenderNoticeModal';

function App() {
  const [showGenderNotice, setShowGenderNotice] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<User | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadCountMap, setUnreadCountMap] = useState<Map<string, number>>(new Map());
  const [enrichedChatRooms, setEnrichedChatRooms] = useState<{
    [roomId: string]: {
      lastMessage?: Message;
      unreadCount: number;
    };
  }>({});

  useEffect(() => {
    const seen = localStorage.getItem('genderNoticeSeen');
    if (!seen) {
      setShowGenderNotice(true);
    }
  }, []);

  useEffect(() => {
    const introSeen = localStorage.getItem('introSeen');
    if (introSeen === 'true') {
      setShowIntro(false); // 이미 봤다면 생략
    }
  }, []);

  // ✅ 새 버전 서비스워커 적용 시 자동 새로고침
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    initAnonymousAuth().then(setUid).catch(console.error);
  }, []);

  useEffect(() => {
    if (!uid) return;
    getUserById(uid)
  .then((user) => {
    console.log('🔥 auth.uid:', uid);
    console.log('🔥 currentUser.id:', user?.id);

    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  })
  .catch((error) => {
    console.error('❌ getUserById 오류:', error);
  });
  }, [uid]);

  useEffect(() => {
    getAllUsers()
      .then((users) => {
        console.log(`📦 총 ${users.length}명의 유저를 Firestore에서 읽었습니다.`);
        setUsers(users);
      })
      .catch((err) => {
        console.error('❌ Firestore read 실패:', err);
      });
  }, []);

  useEffect(() => {
    getDAUForDates(['2025-06-23', '2025-06-24', '2025-06-25']).then((res) =>
      res.forEach(({ date, count }) => console.log(`📅 ${date}: ${count}명`))
    );
  }, []);
  
  

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', currentUser.id)
    );

    const unsubscribeChatRooms = onSnapshot(q, (snapshot) => {
      const rooms: ChatRoomType[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ChatRoomType, 'id'>),
      }));
      setChatRooms(rooms);
    });

    const unsubscribeRequests = subscribeToMessageRequestsForUser(
      currentUser.id,
      setMessageRequests
    );

    return () => {
      unsubscribeChatRooms();
      if (typeof unsubscribeRequests === 'function') {
        unsubscribeRequests();
      }
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || chatRooms.length === 0) return;

    const unsubscribes: (() => void)[] = [];

    chatRooms.forEach((room) => {
      const messagesRef = collection(db, 'chatRooms', room.id, 'messages');

      const latestMessageQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
      const latestUnsub = onSnapshot(latestMessageQuery, (snapshot) => {
        const latestDoc = snapshot.docs[0];
        const lastMessage = latestDoc?.data() as Message | undefined;

        setEnrichedChatRooms((prevState: any) => ({
          ...prevState,
          [room.id]: {
            ...prevState[room.id],
            lastMessage,
            unreadCount: unreadCountMap.get(room.id) || 0,
          },
        }));
      });

      unsubscribes.push(latestUnsub);

      const handleCloseNotice = () => {
        localStorage.setItem('genderNoticeSeen', 'true');
        setShowGenderNotice(false);
      };
    

      const unreadQuery = query(
        messagesRef,
        where('to', '==', currentUser.id),
        where('isRead', '==', false)
      );

      const unreadUnsub = onSnapshot(unreadQuery, (snapshot) => {
        const unreadCount = snapshot.size;

        setUnreadCountMap((prevMap) => {
          const updatedMap = new Map(prevMap);
          updatedMap.set(room.id, unreadCount);
          return updatedMap;
        });

        setEnrichedChatRooms((prev) => ({
          ...prev,
          [room.id]: {
            ...prev[room.id],
            unreadCount,
          },
        }));
      });

      unsubscribes.push(unreadUnsub);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser, chatRooms]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        console.log('🔥 DAU 기록 시작:', user.uid);
        trackDAU();
      }
    });
    return () => unsubscribe();
  }, []);
  

  useEffect(() => {
    if (!currentUser || chatRooms.length === 0) return;

    const unsubscribes: (() => void)[] = [];
    const countMap = new Map<string, number>();

    chatRooms.forEach((room) => {
      const messagesRef = collection(db, 'chatRooms', room.id, 'messages');

      const unreadQuery = query(
        messagesRef,
        where('to', '==', currentUser.id),
        where('isRead', '==', false)
      );

      const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
        countMap.set(room.id, snapshot.size);
        const total = Array.from(countMap.values()).reduce((a, b) => a + b, 0);
        setUnreadMessageCount(total);
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser, chatRooms]);

  const loadChatData = () => {
    if (!currentUser || chatRooms.length === 0) return;

    const unsubscribes: (() => void)[] = [];
    const countMap = new Map<string, number>();

    chatRooms.forEach((room) => {
      const messagesRef = collection(db, 'chatRooms', room.id, 'messages');

      const unreadQuery = query(
        messagesRef,
        where('to', '==', currentUser.id),
        where('isRead', '==', false)
      );

      const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
        countMap.set(room.id, snapshot.size);
        const total = Array.from(countMap.values()).reduce((a, b) => a + b, 0);
        setUnreadMessageCount(total);
      });

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  };

  // ✅ 여기에 추가하세요
  const logTotalMessageRequestCount = async () => {
    const q = collection(db, 'messageRequests');
    try {
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      console.log(`📊 총 누적 메시지 요청 수: ${count}`);
    } catch (err) {
      console.error('❌ 메시지 요청 수 계산 실패:', err);
    }
  };

  // ✅ 앱 시작 시 1회 실행: 운영자 콘솔에 수치 출력됨
  useEffect(() => {
    logTotalMessageRequestCount();
    logMonthlyMessageRequestCount();
  }, []);

  const handleIntroFinish = () => {
    localStorage.setItem('introSeen', 'true');
    setShowIntro(false);
  };

  const handleProfileComplete = async (user: User) => {
    await saveUser(user);
    setCurrentUser(user);
    setUsers((prev) => [...prev, user]);
  };

  const handleReact = async (userId: string, emoji: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        const reactions = { ...user.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        const index = reactions[emoji].indexOf(currentUser.id);
        if (index === -1) {
          reactions[emoji].push(currentUser.id);
        } else {
          reactions[emoji].splice(index, 1);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        }
        const updatedUser = { ...user, reactions };
        updateUser(updatedUser);
        return updatedUser;
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const handleMessageRequest = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) setShowMessageModal(targetUser);
  };

  const handleSendMessageRequest = async (message: string) => {
    if (!currentUser || !showMessageModal) return;
    const request: MessageRequest = {
      id: `req_${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId: showMessageModal.id,
      message,
      status: 'pending',
      timestamp: Date.now(),
    };
    await saveMessageRequest(request);
    setMessageRequests((prev) => [...prev, request]);
    const updatedUsers = users.map((user) => {
      if (user.id === showMessageModal.id) {
        const updatedUser = { ...user, messageRequestCount: user.messageRequestCount + 1 };
        updateUser(updatedUser);
        return updatedUser;
      }
      return user;
    });
    setUsers(updatedUsers);
    setShowMessageModal(null);
  };

  const handleAcceptRequest = async (requestId: string) => {
    const request = messageRequests.find((r) => r.id === requestId);
    if (!request || !currentUser) return;
    const updatedRequest = { ...request, status: 'accepted' as const };
    await updateMessageRequest(updatedRequest);
    setMessageRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));
    const chatRoomId = `chat_${Date.now()}`;
    const chatRoom: ChatRoomType = {
      id: chatRoomId,
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      participants: [request.fromUserId, request.toUserId],
      timestamp: Date.now(),
    };
    await saveChatRoom(chatRoom);
    const firstMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: request.fromUserId,
      to: request.toUserId,
      content: request.message,
      timestamp: Date.now(),
      isRead: false,
    };
    await addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), firstMessage);
    setChatRooms((prev) => [...prev, chatRoom]);
    const updatedUser = {
      ...currentUser,
      messageRequestCount: Math.max(0, currentUser.messageRequestCount - 1),
    };
    updateUser(updatedUser);
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
  };

  const logMonthlyMessageRequestCount = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
  
    const startOfMonth = new Date(year, month - 1, 1);
    const startTimestamp = startOfMonth.getTime(); // ✅ 핵심 수정: 숫자형으로
  
    const q = query(
      collection(db, 'messageRequests'),
      where('timestamp', '>=', startTimestamp)
    );
  
    try {
      const snapshot = await getCountFromServer(q);
      const count = snapshot.data().count;
      console.log(`📆 [${year}년 ${month}월] 메시지 요청 수 (광고 노출 수): ${count}건`);
    } catch (err) {
      console.error('❌ 이번 달 메시지 요청 수 계산 실패:', err);
    }
  };
  

  const handleRejectRequest = async (requestId: string) => {
    const request = messageRequests.find((r) => r.id === requestId);
    if (!request || !currentUser) return;
    const updatedRequest = { ...request, status: 'rejected' as const };
    await updateMessageRequest(updatedRequest);
    setMessageRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));
    const updatedUser = {
      ...currentUser,
      messageRequestCount: Math.max(0, currentUser.messageRequestCount - 1),
    };
    updateUser(updatedUser);
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatRoom || !currentUser || !otherUser) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      to: otherUser.id,
      content,
      timestamp: Date.now(),
      isRead: false,
    };

    await addDoc(collection(db, 'chatRooms', selectedChatRoom, 'messages'), message);
  };

  if (showIntro) {
    return <Intro onFinish={handleIntroFinish} />;
  }

  if (!uid) return <div>로그인 중...</div>;
  if (!currentUser) {
    return (
      <>
        <PwaPrompt /> {/* 🔥 안내문을 ProfileSetup 단계에서도 보여줌 */}
        <ProfileSetup uid={uid} onComplete={handleProfileComplete} />
      </>
    );
  }

  const pendingRequestCount = messageRequests.filter(
    (r) => r.status === 'pending' && r.toUserId === currentUser.id
  ).length;

  const selectedRoom = selectedChatRoom ? chatRooms.find((r) => r.id === selectedChatRoom) : null;
  const otherUser = selectedRoom ? users.find((u) => u.id === selectedRoom.participants.find((p) => p !== currentUser.id)) : null;

  if (selectedRoom && otherUser) {
    return (
      <ChatRoom
        roomId={selectedRoom.id}
        currentUser={currentUser}
        otherUser={otherUser}
        onSendMessage={handleSendMessage}
        onBack={() => setSelectedChatRoom(null)}
      />
    );
  }

  return (
    <div className="relative w-screen min-h-screen overflow-hidden">
      <BackgroundAura /> {/* 🔥 오오라 배경 추가 */}
  
      {/* 기존 구조 그대로 유지 */}
      <PwaPrompt />
      
      {currentScreen === 'feed' && (
        <ProfileFeed
          users={users}
          currentUser={currentUser}
          onReact={handleReact}
          onMessageRequest={handleMessageRequest}
          onRefresh={() => window.location.reload()}
        />
      )}
  
      {currentScreen === 'requests' && (
        <MessageRequests
          requests={messageRequests.filter((r) => r.toUserId === currentUser.id)}
          users={users}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}
  
      {currentScreen === 'chat' && (
        <ChatList
          users={users}
          currentUserId={currentUser.id}
          onSelectChat={setSelectedChatRoom}
          enrichedChatRooms={enrichedChatRooms}
          setEnrichedChatRooms={setEnrichedChatRooms}
        />
      )}

{currentScreen === 'profile' && (
  <ProfileScreen />
)}

  
      <BottomNavigation
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        messageRequestCount={pendingRequestCount}
        unreadMessageCount={unreadMessageCount}
        loadChatData={loadChatData}
      />
  
      {showMessageModal && (
        <MessageRequestModal
          targetUser={showMessageModal}
          onSend={handleSendMessageRequest}
          onClose={() => setShowMessageModal(null)}
        />
      )}

       {/* ✅ 여기! 성별 알림 모달 */}
    {showGenderNotice && (
      <GenderNoticeModal
        onClose={() => {
          localStorage.setItem('genderNoticeSeen', 'true');
          setShowGenderNotice(false);
        }}
      />
    )}
    </div>
  );
}

export default App;
