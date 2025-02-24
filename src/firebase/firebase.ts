import { initializeApp, FirebaseOptions } from "firebase/app";
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

// 알림 수신 이벤트 핸들러
onMessage(messaging, (payload) => {
  console.log("새로운 알림 수신:", payload);
});

export { messaging, getToken };
