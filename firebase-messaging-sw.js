// firebase-messaging-sw.js
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

messaging.onBackgroundMessage(function (payload) {
  console.log('📦 [firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
