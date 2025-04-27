importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js");

// Firebase 프로젝트의 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyAd09BHdTrKs-oNG-fK5ZILQEMsGEfjdbY",
  authDomain: "carebridge-e8730.firebaseapp.com",
  projectId: "carebridge-e8730",
  storageBucket: "carebridge-e8730",
  messagingSenderId: "1019865103802",
  appId: "1:1019865103802:web:a9f257da7da16e69d2f183",
  measurementId: "G-08ZT100W1E",
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);
  const notification = payload.notification;
  self.registration.showNotification(notification.title, {
    body: notification.body,
    icon: '/icons/192x192.png',
  });
});