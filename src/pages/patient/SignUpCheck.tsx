// SignUpCheck.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function SignUpCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const name = state?.name || "이름 없음"; // 전달받은 이름
  const email = state?.email || "이메일 없음";
  const birth = state?.birth || "생일 없음"
  const gender = state?.selectedgender || "성별 없음"

  const goLogIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/patient-login");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg text-center w-[300px]">
        <h1 className="text-lg font-bold mb-4">입력한 정보가 맞나요?</h1>
        <p className="text-[15px] mb-4">이름: {name}</p>
        <p className="text-[15px] mb-4">이메일: {email}</p>
        <p className="text-[15px] mb-4">생일: {birth}</p>
        <p className="text-[15px] mb-4">성별: {gender === "male" ? "남성" : "여성"}</p>
        <button
          onClick={() => navigate(-1)} // 이전 페이지로 이동
          className="m-2 px-4 py-2 bg-primary-50 text-black font-bold rounded border border-black"
        >
          이전으로
        </button>
        <button
          onClick={goLogIn} // 로그인 페이지로 이동
          className="m-2 px-4 py-2 bg-primary text-white font-bold rounded border border border-primary-400"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default SignUpCheck;
