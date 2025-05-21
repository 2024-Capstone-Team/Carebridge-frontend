//SignUp.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Backbutton from "../../components/common/BackButton";
import axios from "axios";
import Timer from "../../components/common/Timer";
import { motion, AnimatePresence } from "framer-motion";


const SignUp: React.FC = () => {

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  const [remainingTime, setRemainingTime] = useState(300);
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
      const response = await axios.post(`${API_BASE_URL}/api/users/send-otp/${phone}?isSignup=true`);
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
        const response = await axios.post(`${API_BASE_URL}/api/users/verify-otp`, {
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
        w-[90%] 
        flex-col flex items-center text-center"
        style={{
          minHeight: "90vh",
        }}
      >
        <div className="relative w-full">
          <Backbutton className="absolute top-0 left-0 m-4" />
        </div>

        <div className="flex flex-col items-center">
          <img
            src="icons/main-page-logo.png"
            alt="Main Logo"
            className="w-[233px] h-[133px] mt-10"
          />
        </div>
        <h2 className="font-bold text-centered text-[20px]">
          회원가입
        </h2>
        <div
          className="mt-[50px] flex flex-col w-[95%]"
        >
        </div>

        <div className="flex flex-col items-center space-y-3 w-full">
          {/* 이름 */}
          <div className="flex items-center rounded-lg border border-gray-300 w-[80%] h-[35px]">
            <label htmlFor="name" className="w-1/4 pl-3 font-bold text-sm">
              이름
            </label>
            <input
              id="name"
              placeholder="이름을 입력해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-0 text-sm"
            />
          </div>

          {/* 이메일 */}
          <div className="flex items-center rounded-lg border border-gray-300 w-[80%] h-[35px]">
            <label htmlFor="email" className="w-1/4 pl-3 font-bold text-sm">
              이메일
            </label>
            <input
              id="email"
              placeholder="이메일을 입력해주세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-0 text-sm"
            />
          </div>

          {/* 생일 */}
          <div className="flex items-center rounded-lg border border-gray-300 w-[80%] h-[35px]">
            <label htmlFor="birth" className="w-1/4 pl-3 font-bold text-sm">
              생일
            </label>
            <input
              id="birth"
              placeholder="8자리로 입력해주세요."
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              className="border-0 text-sm"
            />
          </div>

          {/* 성별 */}
          <div className="flex items-center w-[80%] h-[35px] rounded-lg border border-gray-300 px-3">
            <label className="w-1/4 font-bold text-sm">성별</label>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={selectedGender === "female"}
                  onChange={() => handleGenderSelect("female")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 rounded-full"
                />
                <span>여성</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={selectedGender === "male"}
                  onChange={() => handleGenderSelect("male")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 rounded-full"
                />
                <span>남성</span>
              </label>
            </div>
          </div>


          {/* 전화번호 */}
          <div className="flex flex-col items-center space-y-2 w-[80%]">
          <div className="flex items-center rounded-lg border border-gray-300 w-full h-[35px]">
            <label htmlFor="name" className="w-1/4 pl-3 font-bold text-sm">
              전화번호
            </label>
            <input
              id="phonenum"
              value={phone}
              onChange={(e) => setPhoneNum(e.target.value)}
              className="border-0 text-sm"
            />
          </div>
            <button className="whitespace-nowrap text-white text-[13px] h-10 w-full font-bold rounded-[10px] bg-primary" onClick={getAuthorizeNum}>
              인증 번호 전송
            </button>
          </div>

          {/* 인증번호*/}
          <AnimatePresence>
            {showTimer && (
              <motion.div
                key="auth-section"
                className="flex flex-col items-center space-y-2 w-[80%]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center rounded-lg border border-gray-300 w-full h-[35px]">
                  <label htmlFor="authCode" className="w-1/4 pl-3 font-bold text-sm">
                    인증번호
                  </label>
                  <div className="flex-1 relative flex items-center pr-2">
                    <input
                      id="authCode"
                      type="text"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      className="border-0 text-sm w-full"
                    />
                    {isVerified && (
                      <img src="/src/assets/verified-icon.png" className="h-[20px] ml-2" alt="Verified" />
                    )}
                  </div>
                </div>

                <button
                  className="whitespace-nowrap text-white text-[13px] h-10 w-full font-bold rounded-[10px] bg-primary"
                  onClick={verifyOtp}
                >
                  인증하기
                </button>

                <div className="text-center text-sm text-red-500">
                  <Timer
                    remainingTime={remainingTime}
                    setRemainingTime={setRemainingTime}
                    showtimer={showTimer}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={() => {
              if (!isVerified) {
                alert("휴대폰 인증을 완료해주세요!")
                return
              }
              handleShowSignUpCheck()
            }}
            type="submit"
            className="w-[90px] h-[40px] font-bold mt-[50px] bg-primary rounded-[10px] text-[13px] text-white"
          >
            회원가입
          </button>
        </div>
      </div>
    </main>
  )
}

export default SignUp;
