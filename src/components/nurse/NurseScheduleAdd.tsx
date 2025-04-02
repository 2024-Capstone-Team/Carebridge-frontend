import React, { useState } from "react";
import axios from "axios";

export interface Patient {
  patientId: number;
  name: string;
}

interface ScheduleAddProps {
  patients: Patient[];
  medicalStaffId: number;
  onCancel: () => void;
}

const ScheduleAdd: React.FC<ScheduleAddProps> = ({ patients, medicalStaffId, onCancel }) => {
  const [patientId, setPatientId] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [category, setCategory] = useState<"SURGERY"|"OUTPATIENT"|"EXAMINATION">("SURGERY");

  const handleSave = async () => {
    if (!patientId) return alert("환자를 선택해주세요.");
    if (!startTime) return alert("시작 일시를 입력해주세요.");
  
    const payload = {
      id: 0,
      patientId,
      medicalStaffId,
      scheduleDate: new Date(startTime).toISOString().replace("Z", ""),
      details: description,
      category,
    };
    console.log("payload:", payload);
  
    try {
      const res = await axios.post(`/api/schedule`, payload);
      alert("스케줄을 성공적으로 추가하였습니다.");
      onCancel();
    } catch (error: any) {
      if (error.response) {
        console.error("백엔드 응답 전체:", error.response);
        alert(`서버 오류: ${error.response.data.message ?? error.response.status}`);
      } else {
        console.error(error);
        alert("네트워크 오류 발생");
      }
    }
  };
  

  return (
    <div className="w-full bg-white rounded-lg p-2">
      <h2 className="text-xl font-semibold mb-2">스케줄 추가</h2>
      <hr />

      <div className="flex my-5 items-center">
        <label className="flex block font-semibold mr-3">환자 선택</label>
        <select className="border items-center w-[300px] p-2" value={patientId} onChange={e => setPatientId(+e.target.value)}>
          <option value={0}>환자를 선택해주세요</option>
          {patients.map(p => (
            <option key={p.patientId} value={p.patientId}>{p.name}</option>
            ))}
        </select>
      </div>
       
      <div className="flex mb-5 items-center">
        <label className="block font-semibold mr-3">일정 내용</label>
        <input
          type="text"
          className="border w-[300px] p-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      
      <div className="flex mb-5 items-center">
        <label className="block font-semibold mr-3">시작 일시</label>
        <input
          type="datetime-local"
          className="border w-[300px] p-2"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />
      </div>
      
      <div className="flex mb-5 items-center">
        <label className="block font-semibold mr-4">카테고리</label>
        <select
          className="border items-center w-[300px] p-2"
          value={category}
          onChange={e => setCategory(e.target.value as any)}
        >
          <option value="SURGERY">SURGERY</option>
          <option value="OUTPATIENT">OUTPATIENT</option>
          <option value="EXAMINATION">EXAMINATION</option>
        </select>
      </div>
      

      <div className="flex justify-center space-x-3 pt-5">
        <button onClick={onCancel} className="bg-white border border-gray-300 shadow-lg text-lg rounded-md px-2 mx-1 w-[65px] h-[40px] hover:bg-gray-200">취소</button>
        <button onClick={handleSave} className="bg-[#6990B6] border shadow-lg text-white text-lg rounded-md px-2 mx-1 h-[40px] w-[65px]">저장</button>
      </div>
    </div>
  );
};

export default ScheduleAdd;
