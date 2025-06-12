import { User, MessageRequest, ChatRoom } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  USERS: 'users',
  MESSAGE_REQUESTS: 'messageRequests',
  CHAT_ROOMS: 'chatRooms'
};

export const storage = {
  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  getMessageRequests(): MessageRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGE_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  addMessageRequest(request: MessageRequest): void {
    const requests = this.getMessageRequests();
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.MESSAGE_REQUESTS, JSON.stringify(requests));
  },

  updateMessageRequest(updatedRequest: MessageRequest): void {
    const requests = this.getMessageRequests();
    const index = requests.findIndex(r => r.id === updatedRequest.id);
    if (index !== -1) {
      requests[index] = updatedRequest;
      localStorage.setItem(STORAGE_KEYS.MESSAGE_REQUESTS, JSON.stringify(requests));
    }
  },

  getChatRooms(): ChatRoom[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_ROOMS);
    return data ? JSON.parse(data) : [];
  },

  addChatRoom(room: ChatRoom): void {
    const rooms = this.getChatRooms();
    rooms.push(room);
    localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(rooms));
  },

  updateChatRoom(updatedRoom: ChatRoom): void {
    const rooms = this.getChatRooms();
    const index = rooms.findIndex(r => r.id === updatedRoom.id);
    if (index !== -1) {
      rooms[index] = updatedRoom;
      localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(rooms));
    }
  }
};

// Initialize with some sample users if empty
export const initializeSampleData = () => {
  const users = storage.getUsers();
  if (users.length === 0) {
    const sampleUsers: User[] = [
      {
        id: 'sample1',
        nickname: '커피좋아',
        intro: '카페에서 책 읽는 시간이 가장 행복해요 ☕',
        timestamp: Date.now() - 3600000,
        reactions: {},
        messageRequestCount: 0
      },
      {
        id: 'sample2', 
        nickname: '밤하늘',
        intro: '별 보는 걸 좋아하는 천문학과 학생입니다 ✨',
        timestamp: Date.now() - 7200000,
        reactions: {},
        messageRequestCount: 2
      },
      {
        id: 'sample3',
        nickname: '음악덕후',
        intro: '인디밴드 라이브 공연 같이 보러 갈 사람?',
        timestamp: Date.now() - 1800000,
        reactions: {},
        messageRequestCount: 1
      },
      {
        id: 'sample4',
        nickname: '등산러버',
        intro: '주말마다 산에 오르는 게 취미예요 🏔️',
        timestamp: Date.now() - 5400000,
        reactions: {},
        messageRequestCount: 0
      }
    ];

    sampleUsers.forEach(user => storage.addUser(user));
  }
};