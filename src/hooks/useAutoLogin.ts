import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const useAutoLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    const autoLogin = localStorage.getItem("autoLogin") === "true";
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!autoLogin || !accessToken || !refreshToken) return;

    try {
      // Access Token 검증
      await axios.get(`${API_BASE_URL}/users/auto-login`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("자동 로그인 성공");
    } catch (error: any) {
      console.error("자동 로그인 실패:", error);
      if (error.response?.status === 401) {
        console.log("Access Token 만료, Refresh Token으로 재발급");
        await refreshAccessToken();
      }
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/users/refresh-token`, { refreshToken });
      localStorage.setItem("accessToken", response.data.accessToken);
      console.log("🔄 Access Token 재발급 성공");
      await checkAutoLogin();
    } catch (error) {
      console.error("Refresh Token도 만료됨, 재로그인 필요");
      localStorage.clear();
      navigate("/login"); // 로그인 페이지로 이동
    }
  };
};

export default useAutoLogin;
