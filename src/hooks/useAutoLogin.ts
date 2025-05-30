import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// 자동 로그인 API 호출
export const checkAutoLogin = async (): Promise<boolean> => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return false;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/users/auto-login`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      console.log("access token 확인됨");
      return true;
    }
  } catch (error: any) {
    console.error("자동 로그인 실패:", error.response?.data?.message || error.message);
  }

  return false;
};
