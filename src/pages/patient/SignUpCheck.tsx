// patient/SignUpCheck.tsx
// /sign-up-check

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function SignUpCheck() {

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  
  const name = state?.name || "이름 없음";
  const email = state?.email || "이메일 없음";
  const birth = state?.birth || "생일 없음";
  const gender = state?.selectedGender === "male" ? "Male" : "Female";
  const phoneNumber = state?.phone || "전화번호 없음";

  
  const formatBirthToISO = (birth: string) => {
    if (!/^\d{8}$/.test(birth)) {
      console.error("잘못된 생년월일 형식:", birth);
      return null;
    }

    const year = birth.substring(0, 4);
    const month = birth.substring(4, 6);
    const day = birth.substring(6, 8);

    // JSON 날짜 포맷: yyyy-MM-dd'T'HH:mm:ss.SSSXXX
    return `${year}-${month}-${day}T00:00:00.000`;
  };
  
  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const birthDateISO = formatBirthToISO(birth);
    if (!birthDateISO) {
      alert("생년월일 형식이 잘못되었습니다.");
      return;
    }

    // 먼저 환자 정보 등록 시도
    try {
      const today = new Date().toISOString().split(".")[0];
      const patientData = {
        name,
        phoneNumber,
        birthDate: birthDateISO,
        gender,
        email,
        hospitalId: 1, // 임시 병원 ID
        hospitalizationDate: today,
        // guardianContact: "", // 보호자 전화번호는 선택사항
      };
      console.log("Sending patient data:", patientData);

      const response = await axios.post(`${API_BASE_URL}/api/patient/user`, patientData);
      console.log("환자 정보 등록 성공", response.data);
    } catch (error: any) {
      console.error("환자 정보 등록 실패:", error.response?.data || error.message);
      alert(error.response?.data?.message || "환자 정보 저장에 실패했습니다.");
      return;
    }
  
    const userData = {
      userId: 0,
      name,
      phoneNumber,
      birthDate: birthDateISO,
      gender,
      email,
    };

    try{
      const response = await axios.post(`${API_BASE_URL}/api/users/sign-up`, userData);
      console.log("회원가입에 성공하였습니다. 다시 로그인해주세요.", response.data);
      navigate("/patient-login");
    } catch (error: any) {
      console.error("회원가입 실패:", error);
      alert(error.response?.data?.message || "회원가입에 실패했습니다.");
      
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg text-center w-[300px]">
        <h1 className="text-lg font-bold mb-4">입력한 정보가 맞나요?</h1>
        <p className="text-[15px] mb-4">이름: {name}</p>
        <p className="text-[15px] mb-4">이메일: {email}</p>
        <p className="text-[15px] mb-4">생일: {birth}</p>
        <p className="text-[15px] mb-4">전화번호: {phoneNumber} </p>
        <p className="text-[15px] mb-4">성별: {gender === "Male" ? "남성" : "여성"}</p>
        <button
          onClick={() => navigate(-1)}
          className="m-2 px-4 py-2 bg-primary-50 text-black font-bold rounded border border-black"
        >
          이전으로
        </button>
        <button
          onClick={signUp}
          className="m-2 px-4 py-2 bg-primary text-white font-bold rounded border border-primary-400"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default SignUpCheck;
