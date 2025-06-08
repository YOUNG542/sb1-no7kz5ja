import { db } from './config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { User, MessageRequest, ChatRoom } from '../types';
import { onSnapshot } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore'; 

export const saveUser = async (user: User) => {
  await setDoc(doc(db, 'users', user.id), user);
};

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map((doc) => doc.data() as User);
};

// ⚠️ 안정성을 위해 updateUser는 merge 방식으로 변경
export const updateUser = async (user: User) => {
  await setDoc(doc(db, 'users', user.id), user, { merge: true });
};

export const getUserById = async (id: string): Promise<User | null> => {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as User) : null;
};

// 🔹 MessageRequest 관련

export const saveMessageRequest = async (request: MessageRequest) => {
  await setDoc(doc(db, 'messageRequests', request.id), request);
};

export const updateMessageRequest = async (request: MessageRequest) => {
  await setDoc(doc(db, 'messageRequests', request.id), request, {
    merge: true,
  });
};

export const subscribeToMessageRequestsForUser = (
  userId: string,
  onUpdate: (requests: MessageRequest[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'messageRequests'),
    where('toUserId', '==', userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => doc.data() as MessageRequest);
    onUpdate(requests);
  });

  return unsubscribe;
};


export const getSentMessageRequests = async (
  userId: string
): Promise<MessageRequest[]> => {
  const q = query(
    collection(db, 'messageRequests'),
    where('fromUserId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as MessageRequest);
};

// 🔹 ChatRoom 관련

export const saveChatRoom = async (room: ChatRoom) => {
  await setDoc(doc(db, 'chatRooms', room.id), {
    ...room, // 객체 구조 분해로 필드 모두 포함
    participants: [room.fromUserId, room.toUserId], // ✅ 핵심 수정
    createdAt: serverTimestamp(), // 서버 기준 시간
  });
};

export const updateChatRoom = async (room: ChatRoom) => {
  await setDoc(doc(db, 'chatRooms', room.id), room, { merge: true });
};

export const getChatRoomsForUser = async (
  userId: string
): Promise<ChatRoom[]> => {
  const q = query(
    collection(db, 'chatRooms'),
    where('participants', 'array-contains', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ChatRoom);
};
