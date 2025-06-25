import { getAuth } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const trackDAU = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const today = new Date().toISOString().split('T')[0]; // '2025-06-25'
  const userRef = doc(db, `dailyActiveUsers/${today}/users`, user.uid);
  await setDoc(userRef, { timestamp: serverTimestamp() }, { merge: true });
};
