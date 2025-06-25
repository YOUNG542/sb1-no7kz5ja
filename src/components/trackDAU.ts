import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

export const trackDAU = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  // ✅ KST 기준 날짜 계산
  const now = new Date();
  const koreaOffset = 9 * 60 * 60 * 1000;
  const koreaDate = new Date(now.getTime() + koreaOffset);
  const today = koreaDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const userRef = doc(db, `dailyActiveUsers/${today}/users`, user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // 최초 접근한 사용자만 카운트
    await setDoc(userRef, { timestamp: serverTimestamp() });

    const countRef = doc(db, 'dailyActiveUsers', today);
    await setDoc(
      countRef,
      {
        dauCount: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    // 이미 오늘 기록된 사용자라면 카운트 X
    await setDoc(userRef, { timestamp: serverTimestamp() }, { merge: true }); // 기록 시간만 갱신
  }
};
