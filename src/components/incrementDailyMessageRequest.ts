// components/incrementDailyMessageRequest.ts
import { doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const incrementDailyMessageRequest = async () => {
  const now = new Date();
  const koreaOffset = 9 * 60 * 60 * 1000;
  const koreaDate = new Date(now.getTime() + koreaOffset);
  const dateKey = koreaDate.toISOString().split('T')[0]; // '2025-06-26'

  const docRef = doc(db, 'dailyMessageRequests', dateKey);

  try {
    await setDoc(
      docRef,
      {
        count: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('❌ 일별 메시지 요청 카운트 증가 실패:', err);
  }
};
