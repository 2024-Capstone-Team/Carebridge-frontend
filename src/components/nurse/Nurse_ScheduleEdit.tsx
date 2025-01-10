import React, { useState } from "react";

interface ScheduleEditFormProps {
  scheduleId?: string;
}

const ScheduleEditForm: React.FC<ScheduleEditFormProps> = ({ scheduleId }) => {
  const [schedule, setSchedule] = useState({
    target: "홍길동",
    description: "일정의 내용을 입력해주세요.",
    startTime: "2024-12-04 오전 12:00",
    endTime: "2024-12-04 오전 02:00",
    alert: "10분 전",
  });

  const handleSave = () => {
    alert("스케줄이 저장되었습니다.");
    // 저장 로직 추가
  };

  const handleCancel = () => {
  };

  return (
    <div className="w-2/3">
      
      <h2 className="font-semibold text-lg mb-4">스케줄 수정</h2>
      <hr className="mb-4"></hr>

      <div className="pt-2 mb-2">
        <label className="pr-2 font-semibold">대상</label>
        <input type="text" className="border" value={schedule.target} onChange={(e) => setSchedule({ ...schedule, target: e.target.value })}/>
      </div>
      
      <div className="form-group mb-2">
        <label className="pr-2 font-semibold">일정</label>
        <input type="text" className="border" value={schedule.description} onChange={(e) => setSchedule({ ...schedule, description: e.target.value })}/>
      </div>

      <div className="form-group mb-2">
        <label className="pr-2 mb-2 font-semibold">일시</label>
        <input type="text" className="border" value={schedule.startTime} onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}/>
        <span> - </span>
        <input type="text" className="border" value={schedule.endTime} onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}/>
      </div>
      
      <div className="form-group mb-2">
        <label className="pr-2 font-semibold">알림</label>
        <select value={schedule.alert} className="border" onChange={(e) => setSchedule({ ...schedule, alert: e.target.value })}>
          <option value="5분 전">5분 전</option>
          <option value="10분 전">10분 전</option>
          <option value="30분 전">30분 전</option>
        </select>
      </div>

      <div className="flex justify-center p-4">
        <button className="bg-white border shadow-lg rounded-lg" onClick={handleCancel}>취소</button>
        <button className="bg-[#6990B6] border shadow-lg text-white rounded-lg" onClick={handleSave}>저장</button>
      </div>
    </div>
  );
};

export default ScheduleEditForm;
