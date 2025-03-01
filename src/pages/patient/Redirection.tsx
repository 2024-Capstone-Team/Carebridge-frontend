//Redirection.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // URL에서 code 파라미터를 추출
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    console.log("인가코드: ", code);
  
    if (code) {
      handleKakaoCallback(code);
    } else {
      console.error("카카오 인가 코드가 없습니다.");
    }
  }, []);

  const handleKakaoCallback = async (code: string) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/social-login/kakao/token?code=${code}`);
      console.log("카카오 로그인 응답:", response.data);

      if (response.status === 200) {
        // 로그인 성공 시 필요한 작업 (예: 세션 설정 등)
        // 예시로 navigate로 페이지 이동
        navigate("/choose-patient-type");
      } else {
        console.error("카카오 로그인 실패:", response.data);
      }
    } catch (error) {
      console.error("카카오 로그인 처리 중 오류:", error);
      alert("카카오 로그인 처리 중 오류가 발생했습니다.");
    }
  };

  return <div>카카오 로그인 처리 중...</div>;
};

export default KakaoCallbackPage;
