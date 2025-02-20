import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import axios from "axios";
import Timer from "../../components/common/Timer";

const PatientLoginPage: React.FC = () => {
  const [phone, setPhoneNum] = useState("");
  const navigate = useNavigate();
  const { setPatientId } = useUserContext();
  const [otp, setotp] = useState("");
  const [check, setIsCheck] = useState<boolean>(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    const autoLogin = localStorage.getItem("autoLogin") === "true"; // 저장된 값이 "true"인지 확인
    console.log("autologin: ", autoLogin);
    setIsCheck(autoLogin); // 체크박스 상태 설정

    if (autoLogin) {
      const checkSession = async () => {
        try {
          const response = await axios.get("http://localhost:8080/api/users/session-check", {
            withCredentials: true,
          });
          console.log(response.data); 
          
          if (response.data) {
            console.log("자동 로그인 성공:", localStorage.getItem("patientId"), "/ 응답: ",response.data);
            setPatientId(localStorage.getItem("patientId"));
            navigate("/patient-main");
          }
        } catch (err) {
          console.log("자동 로그인 세션 없음", err);
        }
      };

      checkSession();
    }
  }, [navigate, setPatientId]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !otp) {
      alert("전화번호와 인증번호를 입력해주세요.");
      return;
    }

    try {
      const loginResponse = await axios.post("http://localhost:8080/api/users/login", {
        phone,
        otp,
      });
      if (!loginResponse.data) {
        alert("인증번호가 올바르지 않거나 다른 문제가 발생했습니다.");
        return;
      }

      // 로그인 성공 시 patientId를 받아서 상태에 저장
      const patientId = loginResponse.data;
      setPatientId(patientId); //UserContext의 PatientId 업데이트
      localStorage.setItem("patientId", patientId); //localstorage에 patientId 저장
      console.log(patientId);
      navigate("/choose-patient-type");
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
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
      const response = await axios.post(`http://localhost:8080/api/users/send-otp/${phone}?isSignup=false`);
      console.log("인증번호 전송 성공:", response.data);
      setShowTimer(true);
      alert("인증번호가 전송되었습니다.");
    } catch (error) {
      console.error("인증번호 전송 실패:", error);
      alert("인증번호 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };
 

  const goSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/sign-up");
  };

  {/* 카카오톡 로그인 API */}
  const handleKakaoLogin = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/users/social-login/kakao");
      console.log("카카오 로그인 URL:", response.data);
      const kakaoAuthUrl = response.data;

      window.location.href = kakaoAuthUrl;
    } catch (error) {
      console.error("카카오 로그인 URL 요청 실패:", error);
    }
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
            {showTimer && <Timer />}
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
