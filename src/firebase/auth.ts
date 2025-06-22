import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { app } from './config';

const auth = getAuth(app);

export const initAnonymousAuth = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('🔥 로그인 완료 (onAuthStateChanged):', user.uid);
        resolve(user.uid);
      } else {
        signInAnonymously(auth)
          .then((result) => {
            console.log('🔥 익명 로그인 성공:', result.user.uid); // 여기에 로그 추가
            resolve(result.user.uid);
          })
          .catch(reject);
      }
    });
  });
};
