// firebase/messaging.ts
import { getMessaging, getToken } from 'firebase/messaging';
import { firebaseApp } from './config';

const messaging = getMessaging(firebaseApp);

export const requestFcmToken = async (): Promise<string | null> => {
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
    });
    console.log('🟢 FCM 토큰 발급 성공:', token);
    return token;
  } catch (err) {
    console.error('🔴 FCM 토큰 발급 실패:', err);
    return null;
  }
};
