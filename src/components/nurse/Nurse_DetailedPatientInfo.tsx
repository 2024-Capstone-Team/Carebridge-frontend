import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import search from "../../assets/search.png";
import back from "../../assets/back.png";
import axios from "axios";

interface PatientInfo {
  patientId: number;
  name: string;
  birthDate: string;
  gender: string;
  hospitalizationDate: string;
  diagnosis: string;
  hospitalLocation: string;
  phoneNumber: string;
}

interface Nurse_DetailedPatientInfoProps {
    patientId: number; // 선택된 환자의 ID
    onBack: () => void; // 돌아가기 버튼 핸들러
  }

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return "정보 없음"; // null 또는 undefined 처리
    const isoDate = new Date(date); // ISO 형식을 Date 객체로 변환
    const year = isoDate.getFullYear(); // 연도 추출
    const month = String(isoDate.getMonth() + 1).padStart(2, "0"); // 월 추출 및 두 자리로 맞춤
    const day = String(isoDate.getDate()).padStart(2, "0"); // 일 추출 및 두 자리로 맞춤
    return `${year}.${month}.${day}`;
  };
  

  const NurseDetailedPatientInfo: React.FC<Nurse_DetailedPatientInfoProps> = ({ patientId, onBack }) => {
    const [patient, setPatient] = useState<PatientInfo | null>(null);

    // 선택된 환자의 세부 정보 가져오기
    useEffect(() => {
        if (!patientId) {
            console.warn("유효하지 않은 환자 ID:", patientId);
            return;
          }
          
        const fetchPatientDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/patient/user/${patientId}`);
            console.log("환자 세부 정보:", response.data);
            setPatient(response.data);
        } catch (error) {
            console.error("환자 세부 정보를 가져오는 중 오류 발생:", error);
        }
    };
    
    fetchPatientDetails();
}, [patientId]);

if (!patient) {
    return <div className="text-gray-500 text-center">로딩 중...</div>;
  }

    return (
        /*환자 정보 전체 창*/
        <div className="h-full bg-[#DFE6EC] p-3 rounded-lg">

            {/*백 로고, 환자 정보*/}
            <div className="flex relative">
                <img src={back} alt="back" className="w-[1.5em] h-[1.5em] mr-2 cursor-pointer absolute -translate-x-6 translate-y-1" onClick={onBack}/>
                <h2 className="text-lg font-bold mb-4">환자 정보</h2>
            </div>

            {/*검색*/}    
            <div className="flex bg-white w-full mb-3 px-1 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
                <img src={search} alt="search" className="w-[1.5em] h-[1.5em] mr-2"/>
                <input type="text" placeholder="환자 이름을 입력해주세요." className="w-60"/>
            </div>

            {/*환자 인적사항(이름 포함)*/}    
            <div className="overflow-y-auto h-[350px]">
                <div className="mb-1">
                    <h2 className="text-lg  font-semibold">{patient.name}</h2>
                    
                    {/*환자 인적사항(이름 미포함)*/} 
                    <div className="flex justify-between text-gray-500 my-1">
                        <p>생년월일</p>
                        <p>{formatDate(patient.birthDate)}</p>
                    </div>
                    <div className="flex justify-between text-gray-500 my-1">
                        <p>성별</p>
                        <p>{patient.gender === "Male" ? "남" : "여"}</p>
                    </div>
                    <div className="flex justify-between text-gray-500 my-1">
                        <p>입원일</p>
                        <p>{formatDate(patient.hospitalizationDate)}</p>
                    </div>
                    <div className="flex justify-between text-gray-500 my-1">
                        <p>병명</p>
                        <p>{patient.diagnosis || "정보 없음"}</p>
                    </div>
                    <div className="flex justify-between text-gray-500 my-1">
                        <p>병동/호실</p>
                        <p>{patient.hospitalLocation || "정보 없음"}</p>
                    </div>
                    <div className="flex justify-between text-gray-500 my-1">
                        <p>전화번호</p>
                        <p>{patient.phoneNumber || "정보 없음"}</p>
                    </div>
                    <div className="flex justify-end mt-1">
                        <button className="bg-gray-300 border-gray-400 rounded-md border text-center px-2 w-[50px]">채팅</button>
                    </div>
                </div>
                    
                <div>
                    <h2 className="text-lg  font-semibold">요청 기록</h2>
                    <p className="text-gray-500 my-1">2024.12.01</p>
                    
                    <div className="flex justify-between text-gray-500 my-1">
                        <p>진통제 투약</p>
                        <p>요청: 오전 11:40</p>
                    </div>
                    <p className="flex justify-end text-gray-500 my-1">완료: 오전 11:50</p>
                    <hr className="bg-gray-500 my-1"></hr>
                    <hr className="my-2 h-[1px] bg-gray-400"/>
                    <div className="flex justify-between text-gray-500 my-1">
                        <p>진통제 투약</p>
                        <p>요청: 오전 11:40</p>
                    </div>
                    <p className="flex justify-end text-gray-500 my-1">완료: 오전 11:50</p>
                    <hr className="bg-gray-500 my-1"></hr>
                </div>
            </div>
        </div>
      );
}

export default NurseDetailedPatientInfo;