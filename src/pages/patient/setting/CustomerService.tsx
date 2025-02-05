import React from "react";
import { Link } from "react-router-dom";

const CustomerService: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white p-4">
            {/* 상단 헤더 */}
            <div className="relative flex items-center p-2 w-full">
                <Link to="/patient-setting" className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <img src="/src/assets/back.png" alt="뒤로가기" className="w-[28px]" />
                </Link>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-bold text-black">고객센터</p>
                </div>
            </div>

            {/* 자주 묻는 질문 카드 */}
            <div className="flex flex-col items-center p-0 w-full max-w-md h-auto bg-white border-2 border-[#e6e6e6] rounded-[30px] shadow-lg mx-auto mt-4 overflow-y-auto">
                <div className="flex flex-col w-full p-7">
                    <p className="text-[#747474] text-[5vw]">자주 묻는 질문</p>
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-black text-[4vw]">푸시 알림 설정은 이렇게 하면 돼요</p>
                        <button className="text-[#747474] text-[4vw]">▼</button>
                    </div>
                    {/* 추가 질문들 */}
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-black text-[4vw]">질문 2</p>
                        <button className="text-[#747474] text-[4vw]">▼</button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-black text-[4vw]">질문 3</p>
                        <button className="text-[#747474] text-[4vw]">▼</button>
                    </div>
                </div>
            </div>

            {/* 이메일 문의 섹션 */}
            <div className="flex justify-center mt-4">
                <div className="bg-[#DFE6EC] border border-[#e6e6e6] rounded-[30px] p-4 w-full max-w-md text-center shadow-lg">
                    <p className="text-black text-[4vw]">이메일 문의: hanyangcarebridge@gmail.com</p>
                </div>
            </div>
        </div>
    );
}

export default CustomerService;