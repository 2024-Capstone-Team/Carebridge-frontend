import React, { useState, useEffect } from "react";
import search from "../../assets/search.png";
import back from "../../assets/back.png";
import axios from "axios";

interface PatientInfo {
  patientId: number;
  phoneNumber: string;
  name: string;
  birthdate: string;
  gender: string;
  guardianContact: string;
  hospitalId: number;
  hospitalLocation: string;
  chatRoomId: string;
  department: string;
}

interface NursePatientInfoProps {
  onPatientClick: (patientName: string) => void; // 환자 클릭 핸들러
}

const NursePatientInfo: React.FC<NursePatientInfoProps> = ({ onPatientClick }) => {
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // API로부터 환자 데이터 가져오기
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/patient/user"); // API 엔드포인트 수정 가능
        setPatients(response.data); // API 응답 데이터를 상태로 저장
      } catch (error) {
        console.error("환자 데이터를 가져오는 중 에러 발생:", error);
      }
    };

    fetchPatients();
  }, []);

  // 검색어에 따라 필터링된 환자 목록
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#DFE6EC] p-3 rounded-lg ">
      <h2 className="text-lg font-bold mb-4">환자 정보</h2>

      {/*검색 입력창*/}
        <div className="flex bg-white w-full mb-3 px-1 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
          <img src={search} alt="search" className="w-[1.5em] h-[1.5em] mr-2"/>
          <input type="text" placeholder="환자 이름을 입력해주세요." className="w-60" value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}/>
        </div>

        {/*환자 목록 영역*/}
        <div className="overflow-y-auto space-y-4 h-[350px]">
          <ul className="space-y-4 w-full">
            {patients.map((patient, index) => (
              <li key={index} className="patient-info-item p-4 border rounded-lg shadow-sm flex flex-col bg-gray-50" onClick={() => onPatientClick(patient.name)}>
                <div className="patient-name text-base font-semibold">{patient.name}</div>
                <div className="patient-details text-sm text-gray-500">
                  <span>{patient.birthdate}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>   
      </div>
  );
};

export default NursePatientInfo;
