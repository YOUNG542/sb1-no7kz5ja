declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

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
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase/config';

function App() {
  const [uid, setUid] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('feed');
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<User | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
const [unreadMessageCount, setUnreadMessageCount] = useState(0); // 👈 추가
const [unreadCountMap, setUnreadCountMap] = useState<Map<string, number>>(new Map()); // 👈 추가
const [enrichedChatRooms, setEnrichedChatRooms] = useState<{
  [roomId: string]: {
    lastMessage?: Message;
    unreadCount: number;
  };
}>({});



  const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isAndroid = () => /android/.test(window.navigator.userAgent.toLowerCase());

  useEffect(() => {
    initAnonymousAuth().then(setUid).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isAndroid()) {
        setShowInstallPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    if (isIos() && !isInStandaloneMode) {
      setShowInstallPrompt(true);
    }
  }, []);

  useEffect(() => {
    if (!uid) return;
    getUserById(uid).then((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    }).catch(console.error);
  }, [uid]);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
  
    // ✅ chatRooms 실시간 구독
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
  
    // 기존 메시지 요청 구독
    const unsubscribeRequests = subscribeToMessageRequestsForUser(
      currentUser.id,
      setMessageRequests
    );
  
    return () => {
      unsubscribeChatRooms(); // 🔁 구독 해제
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
  
      // ✅ 최신 메시지 1개만 실시간 감지
      const latestMessageQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
      const latestUnsub = onSnapshot(latestMessageQuery, (snapshot) => {
        const latestDoc = snapshot.docs[0];
        const lastMessage = latestDoc?.data() as Message | undefined;
  
        setEnrichedChatRooms((prev) => ({
          ...prev,
          [room.id]: {
            ...prev[room.id],
            lastMessage,
          },
        }));
      });
  
      unsubscribes.push(latestUnsub);
  
      // ✅ 안 읽은 메시지 수 실시간 감지
      const unreadQuery = query(
        messagesRef,
        where('to', '==', currentUser.id),
        where('isRead', '==', false)
      );
  
      const unreadUnsub = onSnapshot(unreadQuery, (snapshot) => {
        const unreadCount = snapshot.size;
  
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
      createdAt: Date.now(),
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
      createdAt: Date.now(),
    };
    await saveChatRoom(chatRoom); // ✅ messages 없이 저장
    
    // 🔥 메시지는 별도로 messages 서브컬렉션에 저장
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
  
    const roomRef = doc(db, 'chatRooms', selectedChatRoom);
    await updateDoc(roomRef, { messages: arrayUnion(message) });
  };
  

  if (!uid) return <div>로그인 중...</div>;
  if (!currentUser) return <ProfileSetup uid={uid} onComplete={handleProfileComplete} />;

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
    <div className="min-h-screen">
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
        />
      )}

<BottomNavigation
  currentScreen={currentScreen}
  onScreenChange={setCurrentScreen}
  messageRequestCount={pendingRequestCount}
  unreadMessageCount={unreadMessageCount} // 👈 추가
/>


      {showMessageModal && (
        <MessageRequestModal
          targetUser={showMessageModal}
          onSend={handleSendMessageRequest}
          onClose={() => setShowMessageModal(null)}
        />
      )}

      {showInstallPrompt && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow z-50">
          {isAndroid() && deferredPrompt ? (
            <button
              onClick={async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                  console.log('User accepted install');
                } else {
                  console.log('User dismissed install');
                }
                setDeferredPrompt(null);
                setShowInstallPrompt(false);
              }}
            >
              앱 설치하기
            </button>
          ) : isIos() ? (
            <p>
             오른쪽 아래 공유 버튼 → Safari로 열기 → 다시 공유 버튼 → 홈 화면에 추가!(앱 설치)
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default App;
