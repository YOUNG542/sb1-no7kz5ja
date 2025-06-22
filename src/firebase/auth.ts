import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { app } from './config';

const auth = getAuth(app);  // ← 이게 먼저 선언돼야 함

console.log('🚀 auth.currentUser?.uid:', auth.currentUser?.uid);

export const initAnonymousAuth = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('🔥 로그인 완료 (onAuthStateChanged): auth.uid:', user.uid);
        resolve(user.uid);
      } else {
        signInAnonymously(auth)
          .then((result) => {
            console.log('🔥 익명 로그인 성공: auth.uid:', result.user.uid);
            resolve(result.user.uid);
          })
          .catch(reject);
      }
    });
  });
};
