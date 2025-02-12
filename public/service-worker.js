import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // Firebase 설정 정보
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      messaging.useServiceWorker(registration);
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    } catch (err) {
      console.log('ServiceWorker registration failed: ', err);S
    }
  });
}

// 알림 권한 요청 및 토큰 발급
async function requestPermission() {
  console.log('권한 요청 중...');

  const permission = await Notification.requestPermission();
  if (permission === 'denied') {
    console.log('알림 권한 허용 안됨');
    return;
  }

  console.log('알림 권한이 허용됨');

  const token = await getToken(messaging, {
    vapidKey: 'BJUyWILXafpvgs5PEuUU1QwUXSGH5B1QrpS_OH1iTph-ljA4skke_RiLJHANorZJsFgkuyRMuNgWYyi0NWrUwv0',
  });

  if (token) console.log('token: ', token);
  else console.log('Can not get Token');

  // 알림 수신 처리
  onMessage(messaging, (payload) => {
    console.log('메시지가 도착했습니다.', payload);
    // ...
  });
}

requestPermission(); 


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('app-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/static/js/bundle.js',
        '/static/css/main.css',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
