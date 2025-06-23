import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  nickname: string;
  intro: string;
  createdAt: Timestamp;
  reactions: Record<string, string[]>; // emoji -> user IDs
  messageRequestCount: number;
}

export interface MessageRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  fromUserId: string;  // ✅ 추가
  toUserId: string;    // ✅ 추가
  participants: string[]; // 이건 선택사항 (saveChatRoom에서 덮어씌우기 때문에 없어도 됨)
  timestamp?: any;     // Firestore Timestamp 타입

}

export interface Message {
  id: string;
  senderId: string;
  to: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}


export type Screen = 'setup' | 'feed' | 'chat' | 'requests' | 'profile';
