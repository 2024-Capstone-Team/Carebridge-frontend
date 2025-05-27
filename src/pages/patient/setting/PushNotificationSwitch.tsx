import { useState, useEffect } from "react";
import { requestForToken, deleteFcmToken } from "../../../firebase/firebase";


export const PushNotificationSwitch: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // 푸시 알림 권한 상태 확인
  useEffect(() => {
    if (Notification.permission !== "default") {
      setIsSubscribed(Notification.permission === "granted");
    }
  }, []);

  // 푸시 알림 켜기
  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("푸시 알림 권한이 거부되었습니다.");
        setIsSubscribed(false);
        return;
      }

      // FCM 토큰 가져오기
      const token = await requestForToken();
      if (token) {
        console.log("푸시 알림 토큰:", token);
        setIsSubscribed(true); // 푸시 알림 활성화 상태로 업데이트
        // alert("푸시 알림이 활성화되었습니다.");
      } else {
        console.error("푸시 알림 토큰을 가져오지 못했습니다.");
      }
    } catch (error) {
      console.error("푸시 알림 활성화 중 오류 발생:", error);
    }
  };

  // 푸시 알림 끄기
  const disableNotifications = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        await deleteFcmToken(token); // FCM 토큰 삭제
        console.log("푸시 알림이 비활성화되었습니다.");
        setIsSubscribed(false); // 푸시 알림 비활성화 상태로 업데이트
        // alert("푸시 알림이 비활성화되었습니다.");
      }
    } catch (error) {
      console.error("푸시 알림 비활성화 중 오류 발생:", error);
      alert("푸시 알림을 끄는 데 오류가 발생했습니다.");
    }
  };

  // 스위치 변경 시 알림 켜기/끄기 처리
  const handleToggleChange = () => {
    if (isSubscribed) {
      disableNotifications();
    } else {
      enableNotifications();
    }
  };

  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto mt-16">
      {/* 푸시 알림 텍스트 */}
      <span className="text-black text-[16px]">푸시 알림</span>

      {/* Toggle Switch */}
      <label className="relative inline-flex cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={isSubscribed} // 스위치 상태 동기화
          onChange={handleToggleChange} // 스위치 상태 변경 시 핸들러 실행
        />
        <div
          className={`w-10 h-5 rounded-full transition-all duration-300 ease-in-out ${
            isSubscribed ? "bg-primary-200" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`absolute w-5 h-5 bg-white border rounded-full transition-all duration-300 ease-in-out ${
            isSubscribed ? "translate-x-5" : "translate-x-0"
          }`}
        ></div>
      </label>
    </div>
  );

};

export default PushNotificationSwitch;