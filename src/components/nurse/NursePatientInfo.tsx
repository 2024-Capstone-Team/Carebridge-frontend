import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import back from "../../assets/back.png";
import Fuse from "fuse.js";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { formatBirthdate, formatGender } from "../../utils/commonUtils";

interface PatientInfo {
  patientId: number;
  name: string;
  birthDate: string;
  gender: string;
}

interface NursePatientInfoProps {
  onPatientClick: (patientId: number) => void; // 환자 클릭 핸들러
}

const NursePatientInfo: React.FC<NursePatientInfoProps> = ({ onPatientClick }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { hospitalId } = useUserContext();
  const staffId = 1;

  const fuse = new Fuse(patients, {
    keys: ["name"],
    threshold: 0.3, // 검색 정확도 설정
  });


  // 환자 데이터 API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/patient/users/${staffId}`);
        const fetchedPatients = response.data.map((patient: any) => ({
          patientId: patient.patientId,
          name: patient.name,
          birthDate: patient.birthDate,
          gender: patient.gender,
        }));

        // 이름 기준으로 정렬
        fetchedPatients.sort((a: PatientInfo, b: PatientInfo) =>
          a.name.localeCompare(b.name, "ko", { sensitivity: "base" })
        );

        setPatients(fetchedPatients);
      } catch (error) {
        console.error("환자 데이터를 가져오는 중 에러 발생:", error);
      }
    };

    fetchPatients();
  }, []);


  // 검색어에 따라 필터링된 환자 목록
  const filteredPatients = searchQuery
    ? fuse.search(searchQuery).map((result) => result.item)
    : patients;


  return (
    <div className="bg-[#DFE6EC] rounded-lg flex flex-col h-full">
      <h2 className="font-bold mb-4" style={{ fontSize: "var(--font-title)" }}>환자 정보</h2>

      {/*검색 입력 창*/}
        <div className="flex bg-gray-50 mb-3 px-1 py-2 border border-gray-300 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400">
          <FaSearch className="text-gray-600 mx-2 h-[20px] w-[20px] pt-1" />
          <input 
            type="text" 
            placeholder="환자 이름을 입력해주세요." 
            className="border-none outline-none w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}/>  
        </div>

        {/*환자 목록 영역*/}
        <div className="space-y-4 overflow-y-auto flex-1 scrollbar-hide">
          <ul className="space-y-4 w-full cursor-pointer">
            {filteredPatients.map((patient) => (
              <li key={patient.patientId} className="flex flex-col" onClick={() => onPatientClick(patient.patientId)}>
                <div className="text-[15px] font-semibold">{patient.name}</div>
                <div className="text-gray-600" style={{ fontSize: "var(--font-caption)" }}>
                  <span>{formatBirthdate(patient.birthDate)} {formatGender(patient.gender)}</span>
                </div>
                <hr className="border-gray-300 mt-2 -mb-2"></hr>
              </li>
            ))}
          </ul>
        </div>   
        
      </div>
  );
};

export default NursePatientInfo;