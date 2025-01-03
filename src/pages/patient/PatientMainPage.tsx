import React from "react";
import * as Separator from "@radix-ui/react-separator";
import { Link } from "react-router-dom";

const PatientMainPage: React.FC = () => {
  return (
    <div className="relative flex flex-col justify-center items-center h-screen bg-white">
      {/* Main Logo */}
      <img
        src="icons/main-page-logo.png"
        alt="Main Logo"
        className="w-[233px] h-[133px] mb-4"
      />
      {/* Card Container */}
      <div className="w-11/12 max-w-md bg-white rounded-lg shadow-lg p-4">
        {/* Title Section */}
        <h1 className="text-lg font-bold text-center">서비스 바로가기</h1>
        <p className="text-sm text-gray-500 text-center">
          아이콘 클릭시 페이지로 넘어갑니다
        </p>
        <div className="mt-4">
          {/* Row 1 */}
          <div className="flex flex-col items-center py-4">
            <div className="w-1/4 flex flex-col items-center">
              <Link to="/patient-chat">
                <img
                  src="/icons/callbell-icon.png"
                  alt="콜벨 서비스"
                  className="w-12 h-12"
                />
              </Link>
              <p className="text-sm mt-1">콜벨 서비스</p>
            </div>
            <ul className="text-sm text-gray-700 text-center mt-2">
              <li>간편 호출 서비스</li>
              <li>빠른 응답 보장</li>
            </ul>
          </div>
          {/* Separator */}
          <Separator.Root className="bg-gray-300 h-px w-full" decorative />
          {/* Row 2 */}
          <div className="flex flex-col items-center py-4">
            <div className="w-1/4 flex flex-col items-center">
              <img
                src="/icons/schedular-icon.png"
                alt="스케줄러"
                className="w-12 h-12"
              />
              <p className="text-sm mt-1">스케줄러</p>
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
              <img
                src="/icons/user-icon.png"
                alt="설정"
                className="w-12 h-12"
              />
              <p className="text-sm mt-1">설정</p>
            </div>
            <ul className="text-sm text-gray-700 text-center mt-2">
              <li>개인화 설정</li>
              <li>앱 환경 관리</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Logout Button */}
    </div>
  );
};

export default PatientMainPage;
