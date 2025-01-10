import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/common/BackButton";

const SignUp: React.FC = () => {
  // 상태로 성별 관리
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const navigate = useNavigate();

  // 버튼 클릭 핸들러
  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
  };

  const goLogIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/patient-login");
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
          // className="grid grid-rows-6 pt-[80px] place-content-evenly"
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
            ></input>
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
                className="ml-2 w-[65%] h-[25px] text-[13px]"
                placeholder="11자리 입력"
              ></input>
            </div>
            <button
              type="submit"
              className="w-[25%] h-[40px] font-bold bg-primary rounded-[10px] text-[13px]"
            >
              인증하기
            </button>
          </div>

          {/* 인증번호 */}
          <div
            className="
            flex items-center m-1
            gap-3 rounded-[10px] w-[95%] h-[40px]
            border border-black border-solid"
          >
            <label
              htmlFor="auth-num"
              className="pl-[10px] font-bold text-[15px] w-[25%] text-left whitespace-nowrap"
            >
              인증번호
            </label>
            <input className="ml-2 w-[45%] h-[25px] text-[13px] "></input>
            <label>남은 시간</label>
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
                  : "bg-primary-200 text-black"
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
                  : "bg-primary-200 text-black"
              }`}
            >
              남성
            </button>
          </div>
        </div>
        <div>
          <button
            onClick={goLogIn}
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
