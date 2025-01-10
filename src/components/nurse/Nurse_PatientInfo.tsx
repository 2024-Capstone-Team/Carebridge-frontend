import React, { useState } from "react";
import search from "../../assets/search.png";
import back from "../../assets/back.png";


interface PatientInfo {
  name: string;
  birthdate: string;
  status: string;
}

interface NursePatientInfoProps {
  onPatientClick: (patientName: string) => void; // 환자 클릭 핸들러
}

const NursePatientInfo: React.FC<NursePatientInfoProps> = ({ onPatientClick }) => {
  const [patients] = useState<PatientInfo[]>([
    { name: "김길동", birthdate: "1999.01.01 ", status: "게실염" },
    { name: "나길동", birthdate: "1988.01.01 ", status: "췌장염" },
  ]);

  return (
    <div className="bg-[#DFE6EC] p-3 rounded-lg relative">
      <h2 className="text-lg font-bold mb-4 absolute -translate-x-4 -translate-y-6">환자 정보</h2>
      <div className="mb-4 w-full absolute -translate-x-4 translate-y-3">
        <div className="flex bg-white w-full mb-3 px-1 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300">
          <img src={search} alt="search" className="w-[1.5em] h-[1.5em] mr-2"/>
          <input type="text" placeholder="환자 이름을 입력해주세요." className="w-60"/>
        </div>
          <ul className="space-y-4 w-full">
            {patients.map((patient, index) => (
              <li key={index} className="patient-info-item p-4 border rounded-lg shadow-sm flex flex-col bg-gray-50" onClick={() => onPatientClick(patient.name)}>
                <div className="patient-name text-base font-semibold">{patient.name}</div>
                <div className="patient-details text-sm text-gray-500">
                  <span>{patient.birthdate}</span>
                  <span>{patient.status}</span>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
};

export default NursePatientInfo;
