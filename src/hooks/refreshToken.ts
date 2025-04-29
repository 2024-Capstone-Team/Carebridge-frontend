import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await axios.post(`${API_BASE_URL}/users/refresh`, null, {
      params: { refreshToken },
    });

    if (response.status === 200 && response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      console.log("새로운 액세스 토큰 발급 완료");
      return true;
    }
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  return false;
};
