declare global {
  interface Navigator {
    standalone?: boolean;
  }
}
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { PostDetail } from './components/PostDetail';
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
import { EditProfile } from './components/EditProfile';
import { MyPosts } from './components/MyPosts';
import { ComplaintPage } from './components/ComplaintPage';
import { MaintenanceModal } from './components/MaintenanceModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { Timestamp } from 'firebase/firestore';
import { TermsModal } from './components/TermsModal';
import { requestFcmToken } from './firebase/messaging';
import { NewIntro } from './components/NewIntro';

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
  const POST_NOTICE_VERSION = 'v6-feedback-acknowledged';
  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  const maintenanceAllowUIDs = ['0aNxffVd7Bd73xk29CCWhJ0A5L83'];
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [currentUserFetched, setCurrentUserFetched] = useState(false);
  const [showReturningIntro, setShowReturningIntro] = useState(false); // 기존유저용


  console.log('🌍 [환경 확인]');
  console.log('🧠 userAgent:', navigator.userAgent);
  console.log('📱 isMobile:', /iphone|ipad|ipod|android/i.test(navigator.userAgent));
  console.log('🏠 standalone:', window.navigator?.standalone); // undefined면 브라우저 모드
  console.log('🌐 location.href:', window.location.href);
  console.log('🟢 isPWA:', window.matchMedia('(display-mode: standalone)').matches);
  

  useEffect(() => {
    const introSeen = localStorage.getItem('introSeen');
    if (introSeen === 'true') {
      setShowIntro(false); // 신규 인트로 생략
      setShowReturningIntro(true); // 기존 유저용 인트로 ON
    }
  }, []);

  useEffect(() => {
    const isMobileBrowser =
      /iphone|ipad|ipod|android/i.test(navigator.userAgent) &&
      !window.navigator.standalone &&
      !window.matchMedia('(display-mode: standalone)').matches;
  
    if (isMobileBrowser) {
      const el = document.createElement('div');
      el.innerText = '📱 모바일 브라우저에서 실행 중';
      el.style.position = 'fixed';
      el.style.top = '20px';
      el.style.left = '20px';
      el.style.zIndex = '99999';
      el.style.padding = '6px 12px';
      el.style.background = 'red';
      el.style.color = 'white';
      document.body.appendChild(el);
  
      console.log('🚨 모바일 브라우저에서 실행되고 있음 (standalone 아님)');
    }
  }, []);
  

  useEffect(() => {
    if (!uid) return;
  
    getUserById(uid)
      .then((user) => {
        setCurrentUser(user ?? null);
      })
      .finally(() => {
        setCurrentUserFetched(true); // ✅ 꼭 있어야 함
      });
  }, [uid]);


  // 유저 정보 불러온 후 조건 검사
useEffect(() => {
  if (currentUser && !currentUser.termsAccepted) {
    setShowTermsModal(true);
  }
}, [currentUser]);

useEffect(() => {
  // 'seenPostNoticeVersion' 값을 체크하여 이전에 표시한 적이 있는지 확인
  const seenVersion = localStorage.getItem('seenPostNoticeVersion');
  if (seenVersion !== POST_NOTICE_VERSION) {
    setShowNotice(true); // 공지 표시
    localStorage.setItem('seenPostNoticeVersion', POST_NOTICE_VERSION); // 공지 표시 후 버전 기록
  }
}, []);

 
// permission 상태 실시간 반영 (iOS는 업데이트 안 되니 초기값만으로 충분)
useEffect(() => {
  try {
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
  } catch (e) {
    console.warn('🚫 Notification 접근 중 에러:', e);
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
    const updateFcmToken = async () => {
      if (!currentUser) return;
  
      const token = await requestFcmToken();
      if (token && currentUser.fcmToken !== token) {
        await updateUser({ ...currentUser, fcmToken: token }); // ✅ Firestore에 저장
        console.log('✅ FCM 토큰 Firestore 저장 완료');
      }
    };
  
    updateFcmToken();
  }, [currentUser]);

  useEffect(() => {
    initAnonymousAuth().then(setUid).catch(console.error);
  }, []);

  useEffect(() => {
    window.addEventListener('error', (e) => {
      console.error('❌ [전역 에러 발생]', e.message, e.filename, e.lineno);
    });
  
    window.addEventListener('unhandledrejection', (e) => {
      console.error('❌ [Unhandled Promise Rejection]', e.reason);
    });
  }, []);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if (typeof Notification === 'undefined') {
          console.warn('🚫 이 브라우저는 Notification API를 지원하지 않음');
          return;
        }
  
        const permission = await Notification.requestPermission();
        console.log('🔔 알림 권한 상태:', permission);
  
        if (permission === 'granted' && currentUser) {
          const token = await requestFcmToken();
          if (token && currentUser.fcmToken !== token) {
            await updateUser({ ...currentUser, fcmToken: token });
            console.log('✅ FCM 토큰 저장 완료');
          }
        }
      } catch (err) {
        console.warn('❌ 알림 권한 요청 중 오류 발생:', err);
      }
    };
  
    requestNotificationPermission();
  }, [currentUser]);
  
  
  

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
      collection(db, 'messageRequests'),
      where('participants', 'array-contains', currentUser.id)// 또는 toUserId
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests: MessageRequest[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as MessageRequest),
        id: doc.id,
      }));
      setMessageRequests(requests);
    });
  
    return () => unsubscribe();
  }, [currentUser]);
  
  
  

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

   

    return () => {
      unsubscribeChatRooms();
     
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
        const updatedUser = {
          ...user,
          messageRequestCount: (user.messageRequestCount || 0) + 1,
        };
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
      messageRequestCount: Math.max(0, (currentUser.messageRequestCount || 0) - 1),
    };
    updateUser(updatedUser);
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
  };

  const handleAskNotification = async () => {
    if (Notification.permission === 'denied') {
      alert('⚠️ 알림이 차단되어 있어요.\n설정 > 앱 > 네버엔딩 홍개팅 > 알림 > 허용으로 바꿔주세요.');

      return;
    }
  
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    console.log('🔔 알림 권한 상태:', permission);
  
    if (permission === 'granted' && currentUser) {
      const token = await requestFcmToken();
      if (token && currentUser.fcmToken !== token) {
        await updateUser({ ...currentUser, fcmToken: token });
        console.log('✅ FCM 토큰 저장 완료');
      }
    }
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
      messageRequestCount: Math.max(0, (currentUser.messageRequestCount || 0) - 1),
    };
    updateUser(updatedUser);
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatRoom || !currentUser) return;
  
    const selectedRoom = chatRooms.find((r) => r.id === selectedChatRoom);
    const otherUser = selectedRoom
      ? users.find((u) => u.id === selectedRoom.participants.find((p) => p !== currentUser.id))
      : null;
  
    if (!selectedRoom || !otherUser) return;
  
    const now = Date.now();
  
    const message: Message = {
      id: `msg_${now}`,
      senderId: currentUser.id,
      to: otherUser.id,
      content,
      timestamp: now,
      isRead: false,
    };
  
    await addDoc(collection(db, 'chatRooms', selectedRoom.id, 'messages'), message);
  
    const chatRoomRef = doc(db, 'chatRooms', selectedRoom.id);
    await updateDoc(chatRoomRef, {
      lastMessage: {
        content,
        timestamp: now,
        senderId: currentUser.id,
      },
      [`unreadCounts.${otherUser.id}`]: increment(1),
    });
  };
  
  try {
    // ✅ 여기에 추가
    if (isMaintenance && (!uid || !maintenanceAllowUIDs.includes(uid))) {
      return <MaintenanceModal onClose={() => window.close()} />;
    }

    if (showIntro) {
      return <Intro onFinish={handleIntroFinish} />; // 신규 유저용 인트로
    }
    
    if (showReturningIntro && !currentUser) {
      return <NewIntro onFinish={() => setShowReturningIntro(false)} />; // 기존 유저용 인트로
    }
    
    if (!uid || !currentUserFetched) {
      return <div className="h-screen flex items-center justify-center text-gray-500 text-sm">로딩 중...</div>;
    }
    
    if (!currentUser) {
      return (
        <>
          <PwaPrompt />
          <ProfileSetup uid={uid} onComplete={handleProfileComplete} />
        </>
      );
    }

  const pendingRequestCount = messageRequests.filter(
    (r) => r.status === 'pending' && r.toUserId === currentUser.id
  ).length;

  const handleAgreeTerms = async () => {
    if (!currentUser) return;
    await updateUser({
      ...currentUser,
      termsAccepted: {
        privacy: true,
        tos: true,
        timestamp: Timestamp.fromDate(new Date()), // 또는 serverTimestamp()
      },
    });
    setShowTermsModal(false);
  };

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

  const isIos = typeof window !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = typeof window !== 'undefined' && window.navigator?.standalone === true;
const showIosAlert =
  isIos &&
  isStandalone &&
  notificationPermission !== 'granted';


  return (
    <>
    {/* ✅ 기존 유저 동의 모달 */}
    {showTermsModal && <TermsModal onAgree={handleAgreeTerms} />}

    {showIosAlert && (
  <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 p-4 rounded-xl shadow-lg z-50 w-[90%] max-w-md text-center text-sm leading-snug">
    <p className="text-gray-800">
      📱 iPhone 사용자 안내<br />
      홈 화면에 추가된 앱에서는<br />
      <strong className="text-pink-600">‘알림 허용하기’ 버튼</strong>을 꼭 눌러야<br />
      채팅 알림을 받을 수 있어요!
    </p>
  </div>
)}


      {/* 🔔 iOS 알림 권한 요청 버튼 (조건: 권한 허용 전) */}
      {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
  <button
    className="..."
    onClick={handleAskNotification}
  >
    🔔 알림 허용하기
  </button>
)}


    <Routes>
      <Route path="/" element={
    <div className="relative w-screen min-h-screen overflow-hidden">
      <BackgroundAura />
  
      <PwaPrompt />
  
     {/* ✅ 테스트 공지 배너 */}
     {showNotice && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md bg-white/90 backdrop-blur-md border border-blue-300 text-blue-900 px-6 py-4 rounded-2xl shadow-lg animate-fade-in">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-blue-500">
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
              d="M13 16h-1v-4h-1m1-4h.01M12 19c4 0 7-3 7-7s-3-7-7-7-7 3-7 7 3 7 7 7z"
            />
          </svg>
        </div>
        <div className="text-sm leading-snug">
  <p className="font-semibold text-blue-600">공지 드립니다</p>
  <p className="mt-1">
    최근 여러분께서 보내주신 피드백을 바탕으로,  
    다음과 같은 **프로필 기능 개선**이 완료되었습니다.
    <br />
    🔹 <span className="font-semibold">프로필 사진 등록 및 변경 기능</span>이 추가되어,  
    이제 나를 표현할 수 있는 이미지를 자유롭게 설정할 수 있어요.
    <br />
    🔹 <span className="font-semibold">관심사 선택 기능</span>이 도입되어,  
    최대 5개의 관심사를 등록하고, 나와 잘 맞는 사람을 더 쉽게 만날 수 있어요.
    <br />
    🔹 상대방 카드에서 <span className="font-semibold">👁️ 아이콘</span>을 누르면  
    해당 유저의 <span className="text-blue-700">프로필 사진 / 한 줄 소개 / 관심사</span>를 한눈에 확인할 수 있습니다.
  </p>
  <p className="mt-1 text-sm text-blue-700">
    더 깊은 연결을 위한 첫걸음, 지금 바로 나만의 프로필을 완성해보세요!  
    늘 소중한 의견 보내주시는 모든 학우 여러분께 감사드립니다.
  </p>
</div>


      </div>
      <button
        onClick={() => setShowNotice(false)}
        className="text-sm text-blue-500 hover:underline mt-1"
      >
        닫기
      </button>
    </div>
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
          messageRequests={messageRequests}
          chatRooms={chatRooms}
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
     } />

  {/* 프로필 페이지 라우트 추가! */}
  <Route path="/profile" element={<ProfileScreen />} />

       {/* ✅ 세부 페이지 라우트 추가 */}
    <Route path="/edit-profile" element={<EditProfile />} />
    <Route path="/my-posts" element={<MyPosts />} />
    <Route path="/complaint" element={<ComplaintPage />} />
     <Route path="/posts/:id" element={<PostDetail />} />

     <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
   </Routes>
   </>
 );
     } catch (err) {
  console.error('❌ App 렌더 중 치명적 오류 발생:', err);
  return (
    <div className="p-6 text-red-600 text-center text-sm">
      ❌ 앱 실행 중 오류가 발생했습니다.<br />잠시 후 다시 시도해주세요.
    </div>
  );
}
} 



export default function WrappedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
