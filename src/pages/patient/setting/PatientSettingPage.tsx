//PatientSettingPage.tsx

import React from "react";
import { Link } from "react-router-dom";

const PatientSettingPage: React.FC = () => {
    return (
<div className="flex flex-col min-h-screen bg-white p-4">
    {/* 상단 헤더 */}
    <div className="relative flex items-center p-2 w-full mb-8">
        <Link to="/patient-main" className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <img src="src/assets/back.png" alt="뒤로가기" className="w-[28px]" />
        </Link>
        <div className="flex-grow flex items-center justify-center">
            <p className="text-bold">환자 설정 페이지</p>
        </div>
    </div>

    {/* 임시 페이지 연결 링크 (참조용)*/}
    <Link to={"/change-phonenum"} > 전화번호 수정
    </Link>
    <Link to={"/change-hospital"} > 병원 변경
    </Link>
    <Link to="/manage-patient"> 환자 관리
    </Link>
    <Link to="/manage-guardian"> 보호자 관리
    </Link>


    {/* 이 둘을 따로 구분해서 띄울 수 있는 로직 상의 필요 */}
    {/* 1. 환자, 보호자를 선택하는 페이지에서 다른 페이지를 만든다 (페이지 수 증가) */}
    {/* 2. 환자인지 보호자인지 구분하는 코드로 다른 페이지를 띄운다 */}


</div>


        
    )
}

export default PatientSettingPage;