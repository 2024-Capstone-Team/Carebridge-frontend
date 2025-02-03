// ./patient/setting/ManageGuardian.tsx

// 환자의 보호자 관리 페이지
import React from "react";
import { Link } from "react-router-dom";


const ManageGuardian: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            {/* 상단 헤더 */}
            <div className="relative flex items-center p-2 w-full">
                <Link to="/patient-setting" className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <img src="src/assets/back.png" alt="뒤로가기" className="w-[28px]" />
                </Link>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-bold">보호자 관리 페이지</p>
                </div>
            </div>
        </div>
    )
}

export default ManageGuardian;