//CustomRequestPage.tsx
//"/custom-request"

import { Link } from "react-router-dom";

const CustomRequestPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white p-4">
        {/* 상단 헤더 */}
        <div className="relative flex items-center p-2 w-full">
            <Link to="/patient-chat-categories" className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <img src="src/assets/back.png" alt="뒤로가기" className="w-[28px]" />
            </Link>
            <div className="flex-grow flex items-center justify-center">
                <p className="font-bold text-[18px]">커스텀 요청 사항</p>
            </div>
        </div>
        <div className="flex flex-col gap-3 items-center justify-center">
          {/* 요청사항 입력 */}
          <div
            className="flex items-center justify-center mt-4
            rounded-[10px] w-full h-[40px]
            border border-black border-solid">
            <input
              className="w-[90%] h-[25px] text-[13px]"
              placeholder="요청사항 입력..." 
            ></input>
          </div>
          <div className="w-full">
          <button
            className="w-[50%] h-[40px] font-bold bg-primary-100 rounded-[10px] text-[13px]"
          >
            확인
          </button>
          <button
            className="w-[50%] h-[40px] font-bold bg-white rounded-[10px] text-[13px]"
          >
            취소
          </button>
          </div>
        </div>
    </div>
              
        )
    }

export default CustomRequestPage;