import { initializeApp } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


// Firebase 프로젝트의 설정 정보
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');

      if (!registration) {
        console.warn("Service Worker가 등록되지 않았습니다.");
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      console.log("FCM 토큰:", token);
      return token;
    } else {
      console.log("알림 권한이 거부됨");
      return null;
    }
  } catch (error) {
    console.error("FCM 토큰 요청 실패:", error);
    return null;
  }
};


export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("포그라운드 메시지 수신:", payload);
      resolve(payload);
    });
  });