// patient/SignUpCheck.tsx
// /sign-up-check

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function SignUpCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  
  const name = state?.name || "이름 없음";
  const email = state?.email || "이메일 없음";
  const birth = state?.birth || "생일 없음";
  const gender = state?.selectedgender === "male" ? "Male" : "Female";
  const phone = state?.phone || "전화번호 없음";

  
  const formatBirthToISO = (birth: string) => {
    if (!/^\d{8}$/.test(birth)) {
      console.error("잘못된 생년월일 형식:", birth);
      return null;
    }
    
    const year = birth.substring(0, 4);
    const month = birth.substring(4, 6);
    const day = birth.substring(6, 8);
    
    const formattedDate = `${year}-${month}-${day}T00:00:00.000Z`;
    return formattedDate;
  };
  
  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const birthDateISO = formatBirthToISO(birth);
    if (!birthDateISO) {
      alert("생년월일 형식이 잘못되었습니다.");
      return;
    }
  
    const userData = {
      userId: 0,
      name,
      phone,
      birthDate: birthDateISO,
      gender,
      email,
    };

    try{
      const response = await axios.post("http://localhost:8080/api/users/sign-up", userData);
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
        <p className="text-[15px] mb-4">전화번호: {phone} </p>
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
