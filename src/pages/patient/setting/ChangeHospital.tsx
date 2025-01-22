//ChangeHospital.tsx

import React from "react";
import { Link } from "react-router-dom";

const ChangeHospital: React.FC = () => {
    return (
<div className="flex flex-col min-h-screen bg-white p-4">
    {/* 상단 헤더 */}
    <div className="relative flex items-center p-2 w-full">
        <Link to="/patient-setting" className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <img src="src/assets/back.png" alt="뒤로가기" className="w-[28px]" />
        </Link>
        <div className="flex-grow flex items-center justify-center">
            <p className="text-bold">병원 변경</p>
        </div>
    </div>
    <div>
        <div
            className="flex items-center mt-4
            rounded-[10px] w-[95%] h-[40px]
            border border-black border-solid">
            <input
                className="ml-4 w-[90%] h-[25px] text-[13px]"
                placeholder="병원 이름 입력" 
            ></input>
        </div>
    </div>
</div>

        // 틀만 만들어두었으니 자유롭게 수정하셔도 됩니다
        // 확인 버튼 추가
        
    )
}

export default ChangeHospital;