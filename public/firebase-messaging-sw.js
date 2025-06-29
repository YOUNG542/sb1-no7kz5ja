importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDYsfLDmWTbt68PAIzpAeZ6ij7rwP_RWHk",
  authDomain: "honggaeting1.firebaseapp.com",
  projectId: "honggaeting1",
  messagingSenderId: "1033603372828",
  appId: "1:1033603372828:web:811b48c9b064ab54b24cd9",
});

const messaging = firebase.messaging();

// ✅ 1. 알림이 백그라운드에서 도착했을 때 보여주기
messaging.onBackgroundMessage(function (payload) {
  console.log('📦 [firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ 2. 알림을 클릭했을 때 앱(탭)만 실행되게 하기
self.addEventListener('notificationclick', function (event) {
  console.log('🖱️ 알림 클릭됨');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if ('focus' in client) return client.focus(); // 기존 탭 포커스
      }
      if (clients.openWindow) return clients.openWindow('/'); // 새 탭 열기 (홈으로)
    })
  );
});
