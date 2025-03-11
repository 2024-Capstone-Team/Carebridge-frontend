//SignUp.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/common/BackButton";
import axios from "axios";
import Timer from "../../components/common/Timer";

const SignUp: React.FC = () => {
  
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const [showTimer, setShowTimer] = useState(false);

  // 버튼 클릭 핸들러
  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
  };

  // 인증 완료 버튼
  const handleVerify = () => {
    setIsVerified(true); // 버튼 클릭 시 이미지 표시
  };


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhoneNum] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  


  // 생일 확인
  const isEightDigitNumber = (input: string) => {
    return /^\d{8}$/.test(input);
  };

  const handleShowSignUpCheck = () => {
    if (name.trim() === "" || email.trim() === "" || birth.trim() === "") {
      alert("모든 정보를 입력해주세요!");
      return;
    } else if (!isEightDigitNumber(birth)) { // 생일이 여덟 자리인지 확인
      
      alert("생일은 여덟 자리 숫자여야 합니다!");
      return;
    }
    navigate("/sign-up-check", { state: { name, email, birth, selectedGender, phone } }); // SignUpCheck 페이지로 상태 전달

  };

  
  {/* 인증번호 전송 API */}
  const getAuthorizeNum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert("전화번호를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/api/users/send-otp/${phone}?isSignup=true`);
      console.log("인증번호 전송 성공:", response.data);
      setShowTimer(true);
      alert("인증번호가 전송되었습니다.");
    } catch (error) {
      console.error("인증번호 전송 실패:", error);
      alert("이미 가입된 번호입니다. 로그인하거나 다른 전화번호로 다시 시도해주세요.");
    }
  };

    // 인증번호 확인
    const verifyOtp = async () => {
      if (!authCode) {
        alert("인증번호를 입력해주세요.");
        return;
      }
    
      try {
        const response = await axios.post("http://localhost:8080/api/users/verify-otp", {
          phone,
          otp: authCode,
        });
    
        if (response.data) {
          setIsVerified(true);
          alert("인증이 완료되었습니다.");
          setShowTimer(false);
        } else {
          alert("인증 실패: OTP가 올바르지 않거나 만료되었습니다.");
        }
      } catch (error) {
        console.error("OTP 확인 오류:", error);
        alert("인증번호가 올바르지 않습니다.");
      }
    };


  return (
    
    <main className="centered-container">
      <div
        className="bg-white rounded-lg shadow-lg
        p-3 w-[90%]
        flex-col flex items-center text-center"
        style={{
          minHeight: "90vh",
        }}
      >
        <div className="relative w-full">
          <BackButton className="absolute top-0 left-0 m-4" />
        </div>

        <div className="flex flex-col items-center">
          <img
            src="icons/main-page-logo.png"
            alt="Main Logo"
            className="w-[233px] h-[133px] mt-10"
          />
        </div>
        <div>
          <div className="font-bold text-centered">회원가입</div>
        </div>
        <div
          className="mt-[60px] flex flex-col w-[95%]"
        >
          
          {/* 이름 */}
          <div
            className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[95%] h-[40px]
            border border-black border-solid whitespace-nowrap"
          >
            <label
              htmlFor="patient-name"
              className="pl-[10px] font-bold text-[15px] w-[25%] text-left"
            >
              이름
            </label>
            <input
              className="ml-2 w-[65%] h-[25px] text-[13px]"
              placeholder="이름을 입력해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></input>
          
          </div>

          {/* 이메일 */}
          <div
            className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[95%] h-[40px]
            border border-black border-solid"
          >
            <label
              htmlFor="email"
              className="pl-[10px] font-bold text-[15px] w-[25%] text-left"
            >
              이메일
            </label>
            <input
              className="ml-2 w-[65%] h-[25px] text-[13px]"
              placeholder="이메일을 입력해주세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
          </div>

          {/* 생일 */}
          <div
            className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[95%] h-[40px]
            border border-black border-solid"
          >
            <label
              htmlFor="birth-date"
              className="pl-[10px] font-bold text-[15px] w-[25%] text-left"
            >
              생일
            </label>
            <input
              className="ml-2 w-[65%] h-[25px] text-[13px]"
              placeholder="8자리로 입력해주세요."
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
            ></input>
          </div>

          {/* 성별 */}
          <div className="flex items-center w-[95%]">
            <div
              className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[20%] h-[40px]
            "
            >
              <label
                htmlFor="gender"
                className="pl-[10px] font-bold text-[15px] text-left whitespace-nowrap"
              >
                성별
              </label>
            </div>

            {/* 여성 */}
            <button
              onClick={() => handleGenderSelect("female")}
              className={`w-[110px] h-[40px] font-bold rounded-[10px] border ml-3 text-[13px]
              ${
                selectedGender === "female"
                  ? "bg-primary text-black"
                  : "bg-primary-100 text-black"
              }`}

            >
              여성
            </button>

            {/* 남성 */}
            <button
              onClick={() => handleGenderSelect("male")}
              className={`w-[110px] h-[40px] font-bold rounded-[10px] border ml-2 text-[13px]
              ${
                selectedGender === "male"
                  ? "bg-primary text-black"
                  : "bg-primary-100 text-black"
              }`}
            >
              남성
            </button>
          </div>

          {/* 전화번호 */}
          <div className="flex items-center">
            <div
              className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[68%] h-[40px]
            border border-black border-solid"
            >
              <label
                htmlFor="phone-num"
                className="pl-[10px] font-bold text-[15px] w-[40%] text-left whitespace-nowrap"
              >
                전화번호
              </label>
              <input
                type="tel"
                id="phone-number"
                value={phone}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-[65%] h-[25px] text-[13px]"
              />
            </div>
            <button className="whitespace-nowrap text-[13px] h-10 w-20 font-bold rounded-[10px] bg-primary font-[SUITE-Regular]" onClick={getAuthorizeNum}>
              전송
            </button>
          </div>

          {/* 인증번호 */}
          <div className="flex items-center">
            <div
              className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[68%] h-[40px]
            border border-black border-solid"
            >
              <label
                htmlFor="auth-num"
                className="pl-[10px] font-bold text-[15px] w-[40%] text-left whitespace-nowrap"
              >
                인증번호
              </label>
              <input
                type="text"
                id="auth-code"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="w-[65%] h-[25px] text-[13px]"
              />
              {isVerified && ( // 상태가 true일 때만 이미지 표시
                <img src="/src/assets/verified-icon.png" className="h-[20px] pr-1" alt="Verified" />
              )}
              
            </div>
            <button
              className="whitespace-nowrap text-[13px] h-10 w-20 font-bold rounded-[10px] bg-primary font-[SUITE-Regular]"
              onClick={verifyOtp}
            >
              인증하기
            </button>
          </div>          
        </div>
        {showTimer && <Timer />}
        <div>
        <button
          onClick={() => {
            if (!isVerified) {
              alert("휴대폰 인증을 완료해주세요!");
              return;
            }
            handleShowSignUpCheck();
          }}
          type="submit"
          className="w-[90px] h-[40px] font-bold mt-[50px] bg-primary rounded-[10px] text-[13px]"
        >
          회원가입
        </button>

        </div>
      </div>
    </main>
  );
};

export default SignUp;
