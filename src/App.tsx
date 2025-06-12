declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

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
  const [showInstallMessage, setShowInstallMessage] = useState(false);
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null); 

  useEffect(() => {
    initAnonymousAuth().then(setUid).catch(console.error);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallMessage(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator.standalone === true);
  
    console.log('📱 isMobile:', isMobile);
    console.log('🧩 isInStandaloneMode:', isInStandaloneMode);
  
    if (isMobile) {
      setIsStandalone(isInStandaloneMode);
    } else {
      setIsStandalone(true); // 데스크탑은 항상 true
    }
  }, []);
  

  const isIos = () => {
    return (
      /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) &&
      !window.navigator.standalone
    );
  };

  if (isStandalone === false) {
    return (
      <div className="h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-md">
          {isIos() ? (
            <p className="text-lg font-semibold text-gray-800">
              iOS에서는 Safari에서 공유 버튼을 누른 후 "홈 화면에 추가"를 눌러 앱을 설치해주세요.
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-800">
                이 앱은 설치 후에만 사용할 수 있습니다.
              </p>
              {deferredPrompt ? (
                <button
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={async () => {
                    try {
                      await deferredPrompt.prompt();
                      const result = await deferredPrompt.userChoice;
                      if (result.outcome === 'accepted') {
                        console.log('✅ 사용자 설치 완료');
                      }
                    } catch (err) {
                      console.error('설치 프롬프트 오류:', err);
                    }
                    setDeferredPrompt(null);
                    setShowInstallMessage(false);
                  }}
                >
                  설치하기
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    );
  }
  
  if (isStandalone === null) {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <p className="text-gray-500 text-lg">앱 환경을 확인 중입니다...</p>
      </div>
    );
  }
  

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
    const unsubscribeRequests = subscribeToMessageRequestsForUser(currentUser.id, setMessageRequests);
    getChatRoomsForUser(currentUser.id).then(setChatRooms);
    return () => unsubscribeRequests();
  }, [currentUser]);

  const handleProfileComplete = async (user: User) => {
    await saveUser(user);
    setCurrentUser(user);
    setUsers((prev) => [...prev, user]);
  };

  if (!uid) return <div>로그인 중...</div>;
  if (!currentUser) return <ProfileSetup uid={uid} onComplete={handleProfileComplete} />;

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
    const chatRoom: ChatRoomType = {
      id: `chat_${Date.now()}`,
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      participants: [request.fromUserId, request.toUserId],
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: request.fromUserId,
          content: request.message,
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
    };
    await saveChatRoom(chatRoom);
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
    if (!selectedChatRoom || !currentUser) return;
    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: Date.now(),
    };
    const roomRef = doc(db, 'chatRooms', selectedChatRoom);
    await updateDoc(roomRef, { messages: arrayUnion(message) });
  };

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
        />
      )}

      <BottomNavigation
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        messageRequestCount={pendingRequestCount}
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
