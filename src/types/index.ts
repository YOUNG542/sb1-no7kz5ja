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
  participants: string[];
  messages: Message[];
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export type Screen = 'setup' | 'feed' | 'chat' | 'requests';