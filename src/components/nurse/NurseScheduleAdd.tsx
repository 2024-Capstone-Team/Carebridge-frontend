import React, { useState, useEffect } from "react";
import { formatBirthdate, formatGender } from "../../utils/commonUtils";
import axios from "axios";
import Button from "../common/Button";

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
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [patientId, setPatientId] = useState<number>(0);
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [category, setCategory] = useState<"SURGERY"|"OUTPATIENT"|"EXAMINATION">("SURGERY");

  const calculateAge = (birthDateString: string): number => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const isBeforeBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

    if (isBeforeBirthday) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (patientId > 0) {
      axios
        .get(`${API_BASE_URL}/api/patient/user/${patientId}`)
        .then((res) => {
          const p = res.data;
          setBirthDate(formatBirthdate(p.birthDate));
          setGender(formatGender(p.gender));
          setAge(calculateAge(p.birthDate));
        })
        .catch((err) => {
          console.error("환자 정보 불러오기 실패:", err);
          setBirthDate("");
          setGender("");
          setAge(0);
        });
    } else {
      setBirthDate("");
      setGender("");
      setAge(0);
    }
  }, [patientId]);

  const handleSave = async () => {
    if (!patientId) return alert("환자를 선택해주세요.");
    if (!startTime) return alert("시작 일시를 입력해주세요.");
  
    const selectedDate = new Date(startTime);
    const offset = selectedDate.getTimezoneOffset() * 60000; // 분을 밀리초로 변환
    const localISOTime = new Date(selectedDate.getTime() - offset).toISOString().slice(0, 19);

    const payload = {
      id: 0,
      patientId,
      medicalStaffId,
      scheduleDate: localISOTime,
      details: description,
      category,
    };
    console.log("payload:", payload);
  
    try {
      const res = await axios.post(`${API_BASE_URL}/api/schedule`, payload);
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
    <div className="h-full bg-white rounded-lg p-4 overflow-y-auto">
      <h2 className="font-semibold mb-2" style={{fontSize: "var(--font-title)" }}>스케줄 추가</h2>
      <hr />

      <div className="flex my-5 items-center">
        <label className="flex block text-[18px] font-semibold mr-3">환자 선택</label>
        <select className="border items-center rounded-lg w-[300px] p-2" value={patientId} onChange={e => setPatientId(+e.target.value)}>
          <option value={0}>환자를 선택해주세요</option>
          {patients.map(p => (
            <option key={p.patientId} value={p.patientId}>{p.name}</option>
            ))}
        </select>

        {patientId > 0 && (
          <div className="text-gray-400 text-[13px] ml-2">
            <span>{birthDate}  만 {age}세  {gender}</span>
            </div>
          )}
        
      </div>
       
      <div className="flex mb-5 items-center">
        <label className="text-[18px] block font-semibold mr-3">일정 내용</label>
        <input
          type="text"
          className="border w-[300px] p-2 rounded-lg"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      
      <div className="flex mb-5 items-center">
        <label className="text-[18px] block font-semibold mr-3">시작 일시</label>
        <input
          type="datetime-local"
          className="border w-[300px] p-2 rounded-lg"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />
      </div>
      
      <div className="flex mb-5 items-center">
        <label className="text-[18px] block font-semibold mr-4">카테고리</label>
        <select
          className="border items-center w-[300px] p-2 rounded-lg"
          value={category}
          onChange={e => setCategory(e.target.value as any)}
        >
          <option value="SURGERY">SURGERY</option>
          <option value="OUTPATIENT">OUTPATIENT</option>
          <option value="EXAMINATION">EXAMINATION</option>
        </select>
      </div>
      

      <div className="flex justify-center space-x-3 pt-5">
        <Button 
          onClick={onCancel}
          variant="cancel"
          size='large'
        >
          취소
        </Button>
              
        <Button 
          onClick={handleSave}
          variant="save"
          size='large'
        >
          저장
        </Button>
      </div>
    </div>
  );
};

export default ScheduleAdd;
