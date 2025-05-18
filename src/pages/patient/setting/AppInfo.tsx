import React from "react";
import { Link } from "react-router-dom";

// 상수 정의
const ASSETS = {
  BACK_ICON: "/src/assets/back.png",
  LOGO: "/src/assets/carebridge_logo.png"
} as const;

const APP_INFO = {
  NAME: "CareBridge",
  VERSION: "1.0.0"
} as const;

// 헤더 컴포넌트
const Header: React.FC = () => (
  <div className="relative flex items-center p-2 w-full">
    <Link 
      to="/patient-setting" 
      className="absolute left-2 top-1/2 transform -translate-y-1/2"
    >
      <img 
        src={ASSETS.BACK_ICON} 
        alt="뒤로가기" 
        className="w-[28px]" 
      />
    </Link>
    <div className="flex-grow flex items-center justify-center">
      <p className="text-lg font-semibold text-gray-900">앱 정보</p>
    </div>
  </div>
);

// 로고 섹션 컴포넌트
const LogoSection: React.FC = () => (
  <div className="flex justify-center mt-4">
    <img 
      src={ASSETS.LOGO} 
      alt="앱 로고" 
      className="w-[120px] rounded-xl shadow-md" 
    />
  </div>
);

// 버전 정보 컴포넌트
const VersionInfo: React.FC = () => (
  <div className="flex justify-center">
    <p className="text-sm text-gray-600 mt-2">
      {APP_INFO.NAME} v{APP_INFO.VERSION}
    </p>
  </div>
);

/**
 * 앱 정보 페이지 컴포넌트
 * - 앱 로고, 버전 정보 등을 표시
 * - 모바일 환경에 최적화된 레이아웃
 */
const AppInfo: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white p-6 animate-fade-in">
      <Header />
      <LogoSection />
      <VersionInfo />
    </div>
  );
};

<style>
  {`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out;
    }
  `}
</style>

export default AppInfo;