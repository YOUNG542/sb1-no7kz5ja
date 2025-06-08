export interface User {
  id: string;
  nickname: string;
  intro: string;
  createdAt: number;
  reactions: Record<string, string[]>; // emoji -> user IDs
  messageRequestCount: number;
}

export interface MessageRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface ChatRoom {
  id: string;
  fromUserId: string;  // ✅ 추가
  toUserId: string;    // ✅ 추가
  participants: string[]; // 이건 선택사항 (saveChatRoom에서 덮어씌우기 때문에 없어도 됨)
  createdAt?: any;     // Firestore Timestamp 타입
messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export type Screen = 'setup' | 'feed' | 'chat' | 'requests';