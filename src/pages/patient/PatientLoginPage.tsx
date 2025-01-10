// src/pages/PatientLoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PatientLoginPage: React.FC = () => {
  const [phone_num, setPhoneNum] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (phone_num === "") {
      navigate("/choose-patient-type");
    } else {
      alert("등록된 전화번호가 아닙니다.");
    }
  };

  const getAuthorizeNum = (e: React.FormEvent) => {
    e.preventDefault();
    return null;
  };

  const goSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/sign-up");
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
          src="public\icons\icon-192x192.png"
          className="w-[80%] h-auto object-cover"
          style={{ padding: 1 }}
        ></img>
        <h1 className="font-bold text-center mb-6 text-[13px] font-[TAEBAEKfont] mt-[-70px]">
          환자&보호자용 로그인
        </h1>
        <form
          className="space-y-4 flex flex-col items-center m-[80px] w-[250px]"
          onSubmit={handleLogin}
        >
          <div className="flex items-center gap-[10px]">
            <div
              className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[70%] h-[40px]
            border border-black border-solid"
            >
              <label
                htmlFor="auth-num"
                className="pl-[10px] font-bold text-[13px] w-[25%] text-left font-[SUITE-Regular] whitespace-nowrap"
              >
                전화번호
              </label>
              <input
                type="tel"
                id="phone-number"
                value={phone_num}
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

          {/* 인증번호 */}
          <div
            className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[110%] h-[40px]
            border border-black border-solid"
          >
            <label
              htmlFor="auth-num"
              className="pl-[10px] font-bold text-[13px] w-[25%] text-left font-[SUITE-Regular] whitespace-nowrap"
            >
              인증번호
            </label>
            <input className="ml-2 w-[65%] h-[25px] text-[13px] "></input>
          </div>

          <button
            onClick={handleLogin}
            type="submit"
            className=" w-20 h-10 
            font-bold font-[TAEBAEKfont] text-[13px]
            bg-primary-200 rounded-[10px]"
          >
            LOG IN
          </button>
        </form>

        <div
          onClick={goSignUp}
          className="text-[12px] mt-[-60px] text-gray-400 underline"
        >
          회원가입
        </div>

        <hr className="border-gray-400 w-[90%] mt-[120px] mb-[30px]" />
        <form className="flex justify-center items-center">
          <div className="text-[12px] mt-[8px] ">소셜 로그인</div>
          <img
            src="public/icons/kakaotalk-icon.png"
            className="w-[12%] h-auto object-cover ml-[20px] rounded-[10px]"
          />
        </form>
      </div>
    </div>
  );
};

export default PatientLoginPage;
