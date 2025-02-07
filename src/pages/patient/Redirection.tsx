import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Redirection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      const code = searchParams.get("code");
      if (!code) {
        console.error("Authorization code is missing in the URL.");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/oauth/kakao?code=${code}`
        );

        // 액세스 토큰 저장
        const accessToken = response.data.accessToken;
        localStorage.setItem("accessToken", accessToken);

        // 유저 정보 요청
        const userInfo = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/user/info`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        console.log("User Info:", userInfo.data);
        navigate("/"); // 홈으로 이동
      } catch (error) {
        console.error("카카오 로그인 실패", error);
        alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
      }
    };

    fetchToken();
  }, [searchParams, navigate]);

  return <div>로그인 처리 중...</div>;
};

export default Redirection;
