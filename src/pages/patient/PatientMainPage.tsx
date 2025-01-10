import React from "react";
import * as Separator from "@radix-ui/react-separator";
import { Link, useNavigate } from "react-router-dom";

const PatientMainPage: React.FC = () => {
  const navigate = useNavigate();

  const chatBot = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/patient-chat");
  };

  const schedular = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/patient-schedular");
  };

  return (
    <div className="relative flex flex-col justify-center items-center h-screen bg-white">
      {/* Main Logo */}
      <img
        src="icons/main-page-logo.png"
        alt="Main Logo"
        className="w-[233px] h-[133px]"
      />
      {/* Card Container */}
      <div className="w-11/12 max-w-md bg-white rounded-lg shadow-lg p-4 mb-4">
        {/* Title Section */}
        <h1 className="text-lg font-bold text-center font-[TAEBAEKfont]">
          서비스 바로가기
        </h1>
        <p className="text-sm text-gray-500 text-center font-[TAEBAEKfont]">
          아이콘 클릭시 페이지로 넘어갑니다
        </p>
        <div className="mt-4">
          {/* Row 1 */}
          <div className="flex flex-col items-center py-4">
            <div className="w-1/4 flex flex-col items-center">
              <button
                onClick={chatBot}
                className="flex flex-col items-center justify-center
              w-[100px] h-[100px] border-2 border-primary-300 rounded-[10px]
              bg-primary-100
              "
              >
                <img
                  src="/icons/callbell-icon.png"
                  className="w-[60%] h-[60%]"
                />
                <p className="mt-1 font-bold font-[TAEBAEKfont] text-[15px]">
                  콜벨 서비스
                </p>
              </button>
            </div>
            <ul className="text-sm text-gray-700 text-center mt-2 font-[TAEBAEKfont]">
              <li>간편 호출 서비스</li>
              <li>빠른 응답 보장</li>
            </ul>
          </div>
          {/* Separator */}
          <Separator.Root className="bg-gray-300 h-px w-full" decorative />
          {/* Row 2 */}
          <div className="flex flex-col items-center py-4">
            <div className="w-1/4 flex flex-col items-center">
              <button
                onClick={schedular}
                className="flex flex-col items-center justify-center
              w-[100px] h-[100px] border-2 border-primary-300 rounded-[10px]
              bg-primary-100
              "
              >
                <img
                  src="/icons/schedular-icon.png"
                  className="w-[60%] h-[60%]"
                />
                <p className="mt-1 font-bold font-[TAEBAEKfont] text-[15px]">
                  스케쥴러
                </p>
              </button>
            </div>
            <ul className="text-sm text-gray-700 text-center mt-2">
              <li>스케줄 관리</li>
              <li>일정 알림</li>
            </ul>
          </div>
          {/* Separator */}
          <Separator.Root className="bg-gray-300 h-px w-full" decorative />
          {/* Row 3 */}
          <div className="flex flex-col items-center py-4">
            <div className="w-1/4 flex flex-col items-center">
              <button
                className="flex flex-col items-center justify-center
              w-[100px] h-[100px] border-2 border-primary-300 rounded-[10px]
              bg-primary-100
              "
              >
                <img src="/icons/user-icon.png" className="w-[60%] h-[60%]" />
                <p className="mt-1 font-bold font-[TAEBAEKfont] text-[15px]">
                  설정
                </p>
              </button>
            </div>
            <ul className="text-sm text-gray-700 text-center mt-2">
              <li>개인화 설정</li>
              <li>앱 환경 관리</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Logout Button */}
      <div className="absolute -bottom-2 right-0 p-4 flex flex-rows items-center">
        <Link to="/patient-login">
          <img
            src="/icons/logout-icon.png"
            className="w-[28px] h-[28px] mr-2"
          ></img>
        </Link>
        <div className="text-[13px] "> 로그아웃</div>
      </div>
    </div>
  );
};

export default PatientMainPage;
