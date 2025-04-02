import React, { useEffect, useState } from "react";
import axios from "axios";

interface ScheduleEditFormProps {
  scheduleId: number;      // 수정할 스케줄의 ID
  onCancel: () => void;   
}

const ScheduleEditForm: React.FC<ScheduleEditFormProps> = ({ scheduleId, onCancel }) => {
  const [patientId, setPatientId] = useState<number>(0);
  const [patientName, setPatientName] = useState<string>(""); // 환자 이름
  const [medicalStaffId, setMedicalStaffId] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [category, setCategory] = useState<"SURGERY" | "OUTPATIENT" | "EXAMINATION">("SURGERY");

  useEffect(() => {
    if (scheduleId) {
      axios.get(`/api/schedule/${scheduleId}`)
        .then((res) => {
          const data = res.data;
          setPatientId(data.patientId);
          setMedicalStaffId(data.medicalStaffId);

          // scheduleDate를 datetime-local에 맞게 변환
          if (data.scheduleDate) {
            setStartTime(formatDateTimeLocal(data.scheduleDate));
          }
          setDetails(data.details);
          setCategory(data.category);

         // 환자 ID를 이용해 환자 이름 조회
         if (data.patientName) {
          setPatientName(data.patientName);
        } else {
          axios
            .get(`/api/patient/user/${data.patientId}`)
            .then((patientRes) => {
              const patientData = patientRes.data;
              setPatientName(patientData.name);
            })
            .catch((err) => {
              console.error("환자 정보 불러오기 실패:", err);
              setPatientName("알 수 없음");
            });
        }
      })
      .catch((err) => {
        console.error("스케줄 불러오기 실패:", err);
        alert("스케줄 정보를 불러오는 중 오류가 발생했습니다.");
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
      await axios.put(`/api/schedule`, payload);
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
    <div className="w-full bg-white rounded-lg p-2">
      <h2 className="text-xl font-semibold mb-2">스케줄 수정</h2>
      <hr />

      <div className="flex my-5 items-center">
        <label className="flex block font-semibold mr-3">환자 이름</label>
        <input
          type="text"
          className="border items-center w-[300px] p-2"
          value={patientName}
          readOnly
        />
      </div>

      <div className="flex mb-5 items-center">
        <label className="block font-semibold mr-3">일정 내용</label>
        <input
          type="text"
          className="border w-[300px] p-2"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="flex mb-5 items-center">
        <label className="block font-semibold mr-3">시작 일시</label>
        <input
          type="datetime-local"
          className="border w-[300px] p-2"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="flex mb-5 items-center">
        <label className="block font-semibold mr-4">카테고리</label>
        <select
          className="border items-center w-[300px] p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
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

export default ScheduleEditForm;
