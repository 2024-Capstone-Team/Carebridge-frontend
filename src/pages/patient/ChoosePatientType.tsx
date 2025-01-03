import React from "react";
import { useNavigate } from "react-router-dom";

// import BackButton from "../../components/common/BackButton";

const ChoosePatientType: React.FC = () => {
  const navigate = useNavigate();

  const goMainpage = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/patient-mainpage");
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="bg-white p-4 rounded-lg shadow-lg w-80 flex flex-col items-center"
        style={{
          minHeight: "90vh",
        }}
      >
        <div className="relative w-full">
          {/* <BackButton className="absolute top-0 left-0 m-4" /> */}
        </div>
        <div className="flex flex-col items-center">
          {/* 이미지 */}
          <img
            src="public/icons/icon-fit.png"
            className="w-[60%] h-auto object-cover mt-16 mb-4"
          />

          {/* 안내 텍스트 */}
          <h1
            className="font-bold text-center mt-[40px] mb-[100px] text-[15px]"
            style={{ fontFamily: "TAEBAEKfont" }}
          >
            <div className="leading-relaxed text-base">
              OOO님, 환영합니다. <br />
              서비스를 이용하는 대상을 골라주세요.
            </div>
          </h1>

          {/* 환자 버튼 */}
          <button
            onClick={goMainpage}
            type="submit"
            className="w-64 h-11 bg-black text-white font-semibold text-[16px] rounded-lg hover:bg-primary-dark transition-colors mb-4"
          >
            환자
          </button>

          {/* 보호자 버튼 */}
          <button
            onClick={goMainpage}
            type="submit"
            className="w-64 h-11 bg-black text-white font-semibold text-[16px] rounded-lg hover:bg-primary-dark transition-colors"
          >
            보호자
          </button>
        </div>
      </div>
    </main>
  );
};

export default ChoosePatientType;
