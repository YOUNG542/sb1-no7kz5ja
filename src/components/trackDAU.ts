// trackDAU.ts
import { getAuth } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

export const trackDAU = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  // ✅ KST 기준 날짜 계산
  const now = new Date();
  const koreaOffset = 9 * 60 * 60 * 1000; // 9시간 in ms
  const koreaDate = new Date(now.getTime() + koreaOffset);
  const today = koreaDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // ✅ 유저 기록 (subcollection: /users/{uid})
  const userRef = doc(db, `dailyActiveUsers/${today}/users`, user.uid);
  await setDoc(userRef, { timestamp: serverTimestamp() }, { merge: true });

  // ✅ 전체 DAU count 업데이트 (상위 문서)
  const countRef = doc(db, `dailyActiveUsers`, today);
  await setDoc(
    countRef,
    {
      dauCount: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
