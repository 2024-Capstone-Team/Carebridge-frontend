import React, { useState } from 'react';
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";

interface Patient {
  name: string;
  birthdate: string;
  age: string;
  gender: string;
  disease: string;
  request: string;
}

const NurseService: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      name: '홍길동',
      birthdate: '1999.01.01',
      age: '만 25세',
      gender: '남',
      disease: '게실염',
      request: '오전 11:40',
    },
    {
      name: '홍길동',
      birthdate: '1999.01.01',
      age: '만 25세',
      gender: '남',
      disease: '게실염',
      request: '오전 11:40',
    },
    {
      name: '홍길동',
      birthdate: '1999.01.01',
      age: '만 25세',
      gender: '남',
      disease: '게실염',
      request: '오전 11:50',
    },
    {
      name: '홍길동',
      birthdate: '1999.01.01',
      age: '만 25세',
      gender: '남',
      disease: '게실염',
      request: '오전 11:50',
    },
    {
      name: '홍길동',
      birthdate: '1999.01.01',
      age: '만 25세',
      gender: '남',
      disease: '게실염',
      request: '오전 11:50',
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState("전체");

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  return (
    <div className="w-full h-full bg-[#F0F4FA] p-4 border-gray-300">

      <div className=''>
        <button className="bg-[#98B3C8] px-1 w-1/2 text-[12px] text-black font-semibold rounded-none rounded-t-lg">서비스 진행 중(5)</button>
        <button className="bg-gray-300 w-1/2 text-[12px] text-black font-semibold rounded-none rounded-t-lg">서비스 완료(0)</button>
        <div className="bg-[#98B3C8] w-full pl-20 pr-3">
          <select value={selectedStatus} onChange={handleStatusChange} className="w-full border m-1.5 rounded">
          <option value="전체">전체</option>
          <option value="대기">대기</option>
          <option value="진행 중">진행 중</option>
          <option value="완료">완료</option>
          </select>
        </div>
      </div>  

      <div>
        {patients.map((patient, index) => (
          <div key={index} className="mb-3 p-4 bg-white shadow rounded">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{patient.name}</p>
                <p className="text-[11px] text-gray-500">{patient.birthdate} | {patient.age} | {patient.gender} </p>
                <p className='text-[11px] text-gray-500'>{patient.disease}</p>
              </div>
              <div className="text-[11px] text-gray-500">요청: {patient.request}</div>
            </div>
            <div className="mt-2 flex justify-end">
              <h2 className="px-4 py-1 bg-gray-300 text-sm font-semibold rounded mr-2">대기</h2>
              <button className="px-4 py-1 bg-gray-400 text-bla text-sm font-semibold rounded">채팅</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NurseService;
