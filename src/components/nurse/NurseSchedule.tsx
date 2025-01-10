import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Schedule {
  outline: string;
  time: string;
  patientName: string;
}

const NurseSchedule: React.FC = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [scheduleData] = useState<Schedule[]>([
    { outline: "수술", time: "오전 12:00", patientName: "홍길동" },
    { outline: "진료", time: "오전 07:00", patientName: "홍길동" },
    { outline: "검사", time: "오전 08:00", patientName: "홍길동" },
    { outline: "검사", time: "오전 08:00", patientName: "홍길동" },
    { outline: "검사", time: "오전 08:00", patientName: "홍길동" }
  ]);

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/nurse-schedule"); // NurseSchedulePage로 이동
  };

  const handleAddSchedule = () => {
    navigate("/add-schedule"); // "추가" 버튼 클릭 시 이동할 경로
  };

  const handleEditSchedule = (index: number) => {
    navigate("edit-section"); // "수정" 버튼 클릭 시 이동할 경로
  };

  const handleMouseEnter = () => {
    setIsTooltipVisible(true); // 팝업 자세히 알림
  };

  const handleMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  const currentDate = new Date(); // 현재 날짜 표시
  const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  return (
    /*스케줄러 전체 영역*/
    <div className="schedule-container bg-[#DFE6EC] rounded-lg p-4 h-full overflow-y-auto cursor-pointer relative" onClick={handleNavigate}>
      
      {/*스케줄, + 아이콘 영역*/}
      <div className="flex items-center mb-4 absolute -translate-x-4 -translate-y-6">
        <h2 className="schedule-title text-lg font-semibold text-gray-800">스케줄</h2>
        <button className="add-button bg-transparent text-black px-4 py-2"  style={{  }} onClick={handleAddSchedule}>+</button>
      </div>

      <div className="text-sm text-black mb-4 font-semibold absolute -translate-x-4 translate-y-5">{formattedDate}</div>
        <ul className="space-y-4 w-full absolute -translate-x-4 translate-y-11" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {scheduleData.map((schedule, index) => (
            <li key={index} className="schedule-item flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-md">
              <div>
                <div className="schedule-outline font-bold text-gray-800">{schedule.outline}</div>
                <div className="schedule-time text-sm text-gray-600">{schedule.time}</div>
                <div className="schedule-patient text-sm text-gray-500">{schedule.patientName} 환자</div>
              </div>
              <button className="edit-button bg-gray-100 text-[11px] text-gray-500 px-3 py-1 rounded">수정</button>
              {isTooltipVisible && (
              <div className="absolute top-12 left-0 bg-gray-100 p-4 rounded shadow-lg z-10 w-64">
                <div className="font-semibold text-[17px]">{schedule.outline}</div>
                <div className="text-[17px]">{schedule.patientName}</div>
                <p className="text-[12px]">1999.12.01 | 만 25세 | 남 | 게실염</p>
                <p className="text-[12px]">오전 12:00 - 오전 02:00 (2시간)</p>
              </div>
            )}
            </li>
          ))}
        </ul>
      </div>
      );
    };

export default NurseSchedule;
