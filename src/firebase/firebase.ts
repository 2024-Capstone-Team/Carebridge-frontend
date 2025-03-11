import { initializeApp } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


// Firebase 프로젝트의 설정 정보
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAd09BHdTrKs-oNG-fK5ZILQEMsGEfjdbY",
  authDomain: "carebridge-e8730.firebaseapp.com",
  projectId: "carebridge-e8730",
  storageBucket: "carebridge-e8730.firebasestorage.app",
  messagingSenderId: "1019865103802",
  appId: "1:1019865103802:web:a9f257da7da16e69d2f183",
  measurementId: "G-08ZT100W1E"
}

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BJUyWILXafpvgs5PEuUU1QwUXSGH5B1QrpS_OH1iTph-ljA4skke_RiLJHANorZJsFgkuyRMuNgWYyi0NWrUwv0",
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