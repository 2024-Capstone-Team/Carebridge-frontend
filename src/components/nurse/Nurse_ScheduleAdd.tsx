import React, { useState } from "react";

interface ScheduleAddProps {
  scheduleId?: string;
  onCancel: () => void;
}

const ScheduleAdd: React.FC<ScheduleAddProps> = ({ scheduleId, onCancel }) => {
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

  return (
    /*스케줄 수정 전체 창*/
    <div className="w-full bg-white rounded-lg overflow-hidden">
      
      <h2 className="font-semibold text-lg mb-4 pt-2">스케줄 추가</h2>
      <hr className="mb-4"></hr>

      {/*수정 영역*/}
      <div className="mb-4">
        <label className="pr-2 font-semibold mb-1">대상</label>
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

      <div className="flex justify-center p-4 mt-10">
        <button className="bg-white border shadow-lg text-lg rounded-md px-2 mx-1 w-[60px] h-[35px] hover:bg-gray-200" onClick={onCancel}>취소</button>
        <button className="bg-[#6990B6] border shadow-lg text-white text-lg rounded-md px-2 mx-1 w-[60px] h-[35px]" onClick={handleSave}>저장</button>
      </div>
    </div>
  );
};

export default ScheduleAdd;
