//Redirection.tsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
  

const Redirection: React.FC = () => {
  const navigate = useNavigate();
  const { setPatientId } = useUserContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get("patientId");
    setPatientId(patientId);
      if (patientId && patientId.trim() !== "") {
      setPatientId(patientId);
      localStorage.setItem("patientId", patientId);
      console.log("Patient ID 저장 완료:", patientId);
  
      setTimeout(() => {
        navigate("/choose-patient-type");
      }, 100);
    } else {
      console.error("환자 ID가 없습니다.");
      alert("로그인 처리 중 오류가 발생했습니다.");
    }
  }, []);
  

  return <div>로그인 처리 중...</div>;
};

export default Redirection;
