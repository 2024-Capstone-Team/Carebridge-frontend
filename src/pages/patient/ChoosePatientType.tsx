import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import axios from "axios";

const ChoosePatientType: React.FC = () => {
  const navigate = useNavigate();
  const {setIsPatient} = useUserContext();
  const [patientName, setPatientName]= useState("");

  useEffect(() => {
    const fetchPatientName = async() => {
      const patient_id = localStorage.getItem("patientId");
      if (!patient_id) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/patient/user/${patient_id}`);
        setPatientName(response.data.name)
      } catch (error) {
        console.error("환자 이름 조회 실패: ", error);
      }
    };

    fetchPatientName();
  })

  const goMainpage = (e: React.FormEvent, isPatient:boolean) => {
    e.preventDefault();
    setIsPatient(isPatient);
    localStorage.setItem("isPatient", isPatient ? "true" : "false");
    console.log("isPatient: ", isPatient);
    navigate("/patient-main");
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
          <img src="icons/main-page-logo.png" className="w-[233px] h-[133px]" />

          {/* 안내 텍스트 */}
          <h1
            className="font-bold text-center mt-[40px] mb-[100px] text-[15px]"
            style={{ fontFamily: "TAEBAEKfont" }}
          >
            <div className="leading-relaxed text-base">
            {patientName ? `${patientName}님, 환영합니다.` : "환영합니다."} <br />
              서비스를 이용하는 대상을 골라주세요.
            </div>
          </h1>

          {/* 환자 버튼 */}
          <button
            onClick={(e) => goMainpage(e, true)}
            type="submit"
            className="w-64 h-11 bg-black text-white font-semibold text-[16px] rounded-lg hover:bg-primary-dark transition-colors mb-4"
          >
            환자
          </button>

          {/* 보호자 버튼 */}
          <button
            onClick={(e) => goMainpage(e, false)}
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
