import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import axios from "axios";
import Timer from "../../components/common/Timer";
import { requestForToken } from "../../firebase/firebase";
import { checkAutoLogin } from "../../hooks/useAutoLogin";
import { refreshAccessToken } from "../../hooks/refreshToken";


const PatientLoginPage: React.FC = () => {

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [phone, setPhoneNum] = useState("");
  const navigate = useNavigate();
  const { setUserId, setPatientId } = useUserContext();
  const [otp, setotp] = useState("");
  const [check, setIsCheck] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 자동 로그인 체크 상태 초기화 (로컬스토리지에서 가져오기)
  useEffect(() => {
    const autoLogin = localStorage.getItem("autoLogin");
    if (autoLogin === "true") {
      setIsCheck(true);
    } else {
      setIsCheck(false);
    }
  }, []);

  //자동 로그인 기능
  useEffect(() => {
    const autoLogin = async () => {
      const flag = localStorage.getItem("autoLogin");
      if (flag !== "true") {
        console.log("자동 로그인 비활성화됨");
        return;
      } else {
        console.log("자동 로그인 활성화됨");
      }
  
      let isAutoLoggedIn = await checkAutoLogin();
  
      if (!isAutoLoggedIn) {
        const isRefreshed = await refreshAccessToken();
        if (isRefreshed) {
          isAutoLoggedIn = await checkAutoLogin();
        }
      }
  
      if (isAutoLoggedIn) {
        alert("자동 로그인 성공. 메인 화면으로 이동합니다.");
        navigate("/patient-main");
      }
    };
  
    autoLogin();
  }, [check]);


  //타이머 설정
  const [showTimer, setShowTimer] = useState(false);
  const initialTime = 180;
  const [remainingTime, setRemainingTime] = useState(initialTime);

  const handleResend = () => {
    setRemainingTime(initialTime);
    setShowTimer(true);
  }
  
  // 카카오 로그인 API
  const handleKakaoLogin = async () => {
    try {
      const kakaoResponse = await axios.get(`${API_BASE_URL}/api/users/social-login/kakao`);
      console.log("카카오 로그인 URL:", kakaoResponse.data);
      const kakaoAuthUrl = kakaoResponse.data;
      window.location.href = kakaoAuthUrl;
    } catch (error) {
      console.error("카카오 로그인 URL 요청 실패:", error);
    }
  };

  
  {/* 일반 로그인 API */}
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !otp) {
      alert("전화번호와 인증번호를 입력해주세요.");
      return;
    }

    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/users/login`, {
        phone,
        otp,
      });
      if (!loginResponse.data) {
        setErrorMessage("인증번호가 올바르지 않거나 다른 문제가 발생했습니다.");
        return;
      }

      const { userId, patientId, phoneNumber, accessToken, refreshToken } = loginResponse.data;

      setPatientId(patientId);
      setUserId(userId);
      localStorage.setItem("patientId", String(patientId));
      localStorage.setItem("userId", String(userId));
      localStorage.setItem("phoneNumber", phoneNumber);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      if (check) {
        localStorage.setItem("autoLogin", "true");
      } else {
        localStorage.setItem("autoLogin", "false");
      }
      
      try {
        const token = await requestForToken();
        if (token) {
          await axios.post(`${API_BASE_URL}/api/notification/register`, {
            token,
            userId,
          });
          console.log("FCM 토큰 등록 성공");
        }
      } catch (error) {
        console.error("FCM 토큰 등록 실패:", error);
      }

      navigate("/choose-patient-type");
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 400:
            setErrorMessage("잘못된 요청입니다. 입력값을 확인해주세요.");
            break;
          case 401:
            setErrorMessage("인증 실패! OTP를 다시 확인해주세요.");
            break;
          case 404:
            setErrorMessage("등록된 환자를 찾을 수 없습니다.");
            break;
          case 500:
            setErrorMessage("서버 오류 발생. 잠시 후 다시 시도해주세요.");
            break;
          default:
            setErrorMessage("알 수 없는 오류가 발생했습니다.");
        }
      } else {
        setErrorMessage("네트워크 오류 발생. 인터넷 연결을 확인해주세요.");
      }
      console.error("로그인 실패:", error);
    }
  };
  
  {/* 인증번호 전송 API */}
  const getAuthorizeNum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert("전화번호를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/send-otp/${phone}?isSignup=false`);
      console.log("인증번호 전송 성공:", response.data);
      handleResend();
      alert("인증번호가 전송되었습니다.");
    } catch (error: any) {
      console.error("인증번호 전송 실패:", error);
  
      if (axios.isAxiosError(error) && error.response) {
        switch (error.response.status) {
          case 400:
            alert("잘못된 요청입니다. 입력값을 확인해주세요.");
            break;
          case 404:
            alert("등록된 전화번호가 없습니다.");
            break;
          case 500:
            alert("서버 오류로 인해 인증번호를 전송할 수 없습니다. 잠시 후 다시 시도해주세요.");
            break;
          default:
            alert("알 수 없는 오류가 발생했습니다.");
        }
      } else {
        alert("네트워크 오류 발생. 인터넷 연결을 확인해주세요.");
      }
    }
  };

  const goSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/sign-up");
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsCheck(checked);
    localStorage.setItem("autoLogin", checked.toString()); // 체크 상태를 localStorage에 저장
  };

  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-3">
      <div
        className="bg-white p-3 rounded-lg shadow-lg w-80 flex-col flex items-center"
        style={{
          minHeight: "90vh",
        }}
      >
        <img
          src="/icons/icon-192x192.png"
          alt="앱 아이콘"
          className="w-[80%] h-auto object-cover"
          style={{ padding: 1 }}
        />
        <h1 className="font-bold text-center mb-6 text-[13px] font-[TAEBAEKfont] mt-[-70px]">
          환자&보호자용 로그인
        </h1>
        <form
          className="space-y-4 flex flex-col items-center m-[80px] w-[250px]"
          onSubmit={handleLogin}
        >
          {/* 전화번호 입력 */}
          <div className="flex items-center gap-[10px]">
            <div
              className="flex items-center m-1 gap-3 rounded-[10px] w-[70%] h-[40px] border border-black border-solid"
            >
              <label
                htmlFor="phone-number"
                className="pl-[10px] font-bold text-[13px] w-[25%] text-left font-[SUITE-Regular] whitespace-nowrap"
              >
                전화번호
              </label>
              <input
                type="tel"
                id="phone-number" 
                value={phone}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="ml-[10px] mt-[-2px] text-[13px] rounded-[10px] h-[25px] w-[100px] px-2 py-1 "
              />
            </div>
            <button
              className="whitespace-nowrap text-[13px] h-10 w-20 font-bold rounded-[10px] bg-primary font-[SUITE-Regular]"
              onClick={getAuthorizeNum}
            >
              인증받기
            </button>
          </div>

          {/* 인증번호 입력 */}  
          <div className="flex items-center m-1 gap-3 rounded-[10px] w-[110%] h-[40px] border border-black border-solid">
            <label htmlFor="auth-code" className="pl-[10px] font-bold text-[13px] w-[25%] text-left font-[SUITE-Regular] whitespace-nowrap">
              인증번호
            </label>
            <input
              type="text"
              id="auth-code"
              value={otp}
              onChange={(e) => setotp(e.target.value)}
              className="w-[65%] h-[25px] text-[13px]"
            />
            {showTimer && <Timer 
              remainingTime={remainingTime} 
              setRemainingTime={setRemainingTime} 
              showtimer={showTimer} 
            />
            }
          </div>

          {/* 자동 로그인 버튼 */}
          <div className="flex">
            <label className="flex items-center text-[13px] space-x-2">
              <input type="checkbox" checked={check} onChange={handleCheckboxChange} />
              <span>자동 로그인</span>
            </label>
          </div>

          {/* 로그인버튼 */}
          <button
            onClick={handleLogin}
            type="submit"
            className="w-20 h-10 font-bold font-[TAEBAEKfont] text-[13px] bg-primary-200 rounded-[10px]"
          >
            LOG IN
          </button>
        </form>

    
        <div
          onClick={goSignUp}
          className="text-[12px] mt-[-60px] text-gray-400 underline cursor-pointer"
        >
          회원가입
        </div>

        <hr className="border-gray-400 w-[90%] mt-[120px] mb-[30px]" />
        <form className="flex justify-center items-center">
          <div className="text-[12px] mt-[8px] ">소셜 로그인</div>
          <button onClick={handleKakaoLogin} className="ml-[20px] rounded-[10px]">
            <img
              src="/icons/kakaotalk-icon.png"
              alt="카카오 로그인"
              className="w-[36px] h-auto object-cover rounded-[10px]"
            />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientLoginPage;
