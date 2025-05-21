//Redirection.tsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

const Redirection: React.FC = () => {
  const navigate = useNavigate();
  const { setPatientId, setUserId } = useUserContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get("patientId");
    const userId = urlParams.get("userId");
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");

    if (patientId && patientId.trim() !== "") {
      setPatientId(patientId);
      localStorage.setItem("patientId", patientId);
      console.log("Patient ID 저장 완료:", patientId);
    }

    if (userId && userId.trim() !== "") {
      setUserId(userId);
      localStorage.setItem("userId", userId);
    }

    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

    localStorage.setItem("autoLogin", "true");

    if (patientId) {
      setTimeout(() => {
        navigate("/choose-patient-type");
      }, 100);
    } else {
      console.error("환자 ID가 없습니다.");
      alert("로그인 처리 중 오류가 발생했습니다.");
      navigate("/login");
    }
  }, []);

  return <div>로그인 처리 중...</div>;
};

export default Redirection;

