import React, { useState } from "react";
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";

interface Patient {
  id: number;
  name: string;
  birthdate: string;
  condition: string;
}

const NursePatientList: React.FC = () => {
  const [patients] = useState<Patient[]>([
    { id: 1, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
    { id: 2, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
    { id: 3, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
  ]);

  return (
    <div className="h-full pl-4 pr-4 pb-4">
      
      <div className="flex items-center mb-2">
        <img src={bar} alt="hamburger bar" className="w-[1.5em] h-[1.5em] mr-1" />
        <img src={logo} alt="CareBridge logo" className="w-[6em] h-[6em]" />  
      </div>
      
      <div className="bg-[#96B2C7] h-full rounded-lg pr-2 pt-10 pl-2 pb-10 relative">
        <h2 className="text-black font-semibold text-lg mt-2 mb-2 absolute -top-1">환자 목록</h2>
        <div className="h-full bg-white rounded-lg p-2 overflow-y-auto">
          <ul>
          {patients.map((patient) => (
            <li key={patient.id} className="patient-item">
                <div className="mr-1">
                <input type="checkbox" id={`patient-${patient.id}`} />
                <label htmlFor={`patient-${patient.id}`}>
                <span className="font-semibold">{patient.name}</span>
                <p className="text-sm text-gray-500">{patient.birthdate} | {patient.condition}</p>
                </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NursePatientList;
