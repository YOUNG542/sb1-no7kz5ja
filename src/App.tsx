declare global {
  interface Navigator {
    standalone?: boolean;
  }
}
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { PostFeed } from './components/PostFeed';
import { trackDAU } from './components/trackDAU';
import { ProfileScreen } from './components/ProfileScreen'; // ✅ 추가
import { getCountFromServer } from 'firebase/firestore'; // 🔥 총 개수 계산용
import { getDAUForDates } from './components/checkDAU';
import { BackgroundAura } from './components/BackgroundAura';
import { limit, orderBy } from 'firebase/firestore';
import { onSnapshot, query, where } from 'firebase/firestore';
import { PostUploadForm } from './components/PostUploadForm';
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
import { db } from './firebase/config';

import { incrementDailyMessageRequest } from './components/incrementDailyMessageRequest';
import { addDoc, collection, doc, updateDoc, increment } from 'firebase/firestore';
import { isMaintenanceTime } from './utils/timeUtils';
import { MaintenanceModal } from './components/MaintenanceModal';


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
  const [showNotice, setShowNotice] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadCountMap, setUnreadCountMap] = useState<Map<string, number>>(new Map());
  const [enrichedChatRooms, setEnrichedChatRooms] = useState<{
    [roomId: string]: {
      lastMessage?: Message;
      unreadCount: number;
      participants: string[];
    };
  }>({});
  const [showRoomNotice, setShowRoomNotice] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);


  useEffect(() => {
    const exceptionUIDs = ['0aNxffVd7Bd73xk29CCWhJ0A5L83', 'Pvzyoi8VgPMtME0GwstPCXf7wsK2'];
    if (isMaintenanceTime() && !exceptionUIDs.includes(uid || '')) {
      setShowMaintenance(true);
    }
  }, [uid]);


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

  useEffect(() => {
    const hasSeenPostNotice = localStorage.getItem('hasSeenPostNotice');
    if (!hasSeenPostNotice) {
      setShowNotice(true);
      localStorage.setItem('hasSeenPostNotice', 'true');
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
    const seen = localStorage.getItem('roomNoticeSeen');
    if (!seen) {
      setShowRoomNotice(true);
      localStorage.setItem('roomNoticeSeen', 'true');
    }
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
            participants: room.participants || [],
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
    await incrementDailyMessageRequest();
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

  const handleMaintenanceClose = () => {
    window.close(); // 브라우저에서 작동안 할 수 있으니 대안 추가
    window.location.href = 'about:blank';
  };

  if (showMaintenance) {
    return <MaintenanceModal onClose={handleMaintenanceClose} />;
  }

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
  
    const now = Date.now();
  
    const message: Message = {
      id: `msg_${now}`,
      senderId: currentUser.id,
      to: otherUser.id,
      content,
      timestamp: now,
      isRead: false,
    };
  
    // 1. 메시지 저장 (기존과 동일)
    await addDoc(collection(db, 'chatRooms', selectedChatRoom, 'messages'), message);
  
    // 2. chatRooms/{roomId} 문서에 최신 메시지 및 안 읽은 수 업데이트
    const chatRoomRef = doc(db, 'chatRooms', selectedChatRoom);
    await updateDoc(chatRoomRef, {
      lastMessage: {
        content,
        timestamp: now,
        senderId: currentUser.id,
      },
      [`unreadCounts.${otherUser.id}`]: increment(1),
    });
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
      <BackgroundAura />
  
      <PwaPrompt />
  
     {/* ✅ 테스트 공지 배너 */}
{showNotice && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow text-sm">
    ⚠️ 현재 더 나은 사용자 경험을 위해 포스트 기능은 테스트 중이며, 일부 기능이 제대로 작동하지 않을 수 있습니다. 
    <br className="hidden sm:block" />
    가능하면 사용을 자제해 주세요.
    <button
      className="ml-3 text-xs underline"
      onClick={() => setShowNotice(false)}
    >
      닫기
    </button>
  </div>
)}

{showRoomNotice && (
  <div className="fixed top-[72px] left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md bg-white/80 backdrop-blur-md border border-red-300 text-red-800 px-6 py-4 rounded-2xl shadow-lg animate-fade-in">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-red-500">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M5.07 19H18.93A2.07 2.07 0 0021 16.93L12 3 3 16.93A2.07 2.07 0 005.07 19z"
            />
          </svg>
        </div>
        <div className="text-sm leading-snug">
          <p className="font-semibold">채팅방 오류 안내</p>
          <p className="mt-1">
            최근 채팅방 생성 기능에 일시적인 오류가 있었으나, 현재는 모두 정상 작동합니다.
          </p>
        </div>
      </div>
      <button
        onClick={() => setShowRoomNotice(false)}
        className="text-sm text-red-500 hover:underline mt-1"
      >
        닫기
      </button>
    </div>
  </div>
)}

  
      {/* 아래 기존 화면 전환 로직들 */}
      {currentScreen === 'feed' && (
        <ProfileFeed
          users={users}
          currentUser={currentUser}
          onReact={handleReact}
          onMessageRequest={handleMessageRequest}
          onRefresh={() => window.location.reload()}
        />
      )}
  
  {currentScreen === 'posts' && (
  <PostFeed onGoToUpload={() => setCurrentScreen('upload')} />
)}

      {currentScreen === 'upload' && (
  <div className="px-4 pt-6 pb-20 max-w-md mx-auto">
    <PostUploadForm />
  </div>
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
      {currentScreen === 'profile' && <ProfileScreen />}
  
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
  
     
    </div>
  );
  
}

export default App;
