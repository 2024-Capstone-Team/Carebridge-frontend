import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatBirthdate, formatGender } from "../../utils/commonUtils";

interface ScheduleEditFormProps {
  scheduleId: number;      // 수정할 스케줄의 ID
  onCancel: () => void;   
}

const ScheduleEditForm: React.FC<ScheduleEditFormProps> = ({ scheduleId, onCancel }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [patientId, setPatientId] = useState<number>(0);
  const [patientName, setPatientName] = useState<string>(""); // 환자 이름
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<number>(0);
  const [medicalStaffId, setMedicalStaffId] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [category, setCategory] = useState<"SURGERY" | "OUTPATIENT" | "EXAMINATION">("SURGERY");

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
    if (scheduleId) {
      // 스케줄 정보 조회
      axios.get(`${API_BASE_URL}/api/schedule/${scheduleId}`)
        .then((res) => {
          const data = res.data;
          setPatientId(data.patientId);
          setMedicalStaffId(data.medicalStaffId);
          setDetails(data.details);
          setCategory(data.category);

          if (data.scheduleDate) {
            setStartTime(formatDateTimeLocal(data.scheduleDate));
          }

          // 환자 정보 조회
          return axios.get(`${API_BASE_URL}/api/patient/user/${data.patientId}`);
        })
        .then((patientRes) => {
          const p = patientRes.data;
          setPatientName(p.name);
          setBirthDate(formatBirthdate(p.birthDate));
          setGender(formatGender(p.gender));
          setAge(calculateAge(p.birthDate));
        })
        .catch((err) => {
          console.error("정보 불러오기 실패:", err);
          alert("스케줄 또는 환자 정보를 불러오는 중 오류가 발생했습니다.");
        });
    }
  }, [scheduleId]);

  function formatDateTimeLocal(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleSave = async () => {
    const payload = {
      id: scheduleId, 
      patientId,
      medicalStaffId,
      scheduleDate: new Date(startTime).toISOString().replace("Z", ""),
      details,
      category,
    };

    try {
      await axios.put(`${API_BASE_URL}/api/schedule`, payload);
      alert("스케줄이 수정되었습니다.");
      onCancel(); // 수정 완료 후 닫기
    } catch (error: any) {
      if (error.response) {
        console.error("백엔드 응답:", error.response);
        alert(`서버 오류: ${error.response.data.message ?? error.response.status}`);
      } else {
        console.error("네트워크 오류:", error);
        alert("네트워크 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="h-full bg-white rounded-lg p-4 overflow-y-auto">
      <h2 className="font-semibold mb-2" style={{fontSize: "var(--font-title)" }}>스케줄 수정</h2>
      <hr />

      <div className="flex my-5 items-center">
        <label className="flex block text-[18px] font-semibold mr-3">환자 이름</label>
        <input
          type="text"
          className="border items-center w-[300px] p-2 rounded-lg"
          value={patientName}
          readOnly
        />
        <div className="text-gray-400 text-[13px] ml-2">
          <span> {birthDate} 만 {age}세 {gender} </span>
        </div>

      </div>

      <div className="flex mb-5 items-center">
        <label className="block text-[18px] font-semibold mr-3">일정 내용</label>
        <input
          type="text"
          className="border w-[300px] p-2 rounded-lg"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="flex mb-5 items-center">
        <label className="text-[18px] block font-semibold mr-3">시작 일시</label>
        <input
          type="datetime-local"
          className="border w-[300px] p-2 rounded-lg"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="flex mb-5 items-center">
        <label className="text-[18px] block font-semibold mr-4">카테고리</label>
        <select
          className="border items-center w-[300px] p-2 rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          <option value="SURGERY">SURGERY</option>
          <option value="OUTPATIENT">OUTPATIENT</option>
          <option value="EXAMINATION">EXAMINATION</option>
        </select>
      </div>

      <div className="flex justify-center space-x-3 pt-5">
         <button 
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-lg font-medium rounded-md whitespace-nowrap transition-all duration-200 bg-[#F8F8F8] border border-[#E3E3E3] hover:bg-gray-200"
          >
            취소
          </button>
          <button 
            type="submit"
            onClick={handleSave}
            className="bg-[#6990B6] px-3 py-1 text-lg font-medium rounded-md whitespace-nowrap transition-all duration-200 border border-[#306292] text-white hover:bg-[#2c5a8c]"
          >
            저장
          </button>
      </div>
    </div>
  );
};

export default ScheduleEditForm;
