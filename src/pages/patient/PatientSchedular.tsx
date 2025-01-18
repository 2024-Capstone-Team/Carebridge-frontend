//PatientSchedular.tsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import WeekCalendar from "../../components/patient/WeekCalander";
import dayjs from "dayjs";


interface Schedule {
  id: number;
  title: string;
  date: string;
  time: string;
  doctor: string;
  location: string;
  tag: string;
}

// 날짜별 일정 그룹 컴포넌트
const ScheduleGroup: React.FC<{ date: string; schedules: Schedule[] }> = ({
  date,
  schedules,
}) => {
  return (
    <div className="mb-2 border rounded-[20px] p-4 shadow-md bg-white flex">
  {/* 날짜 표시 */}
  <div className="flex flex-col items-center justify-center mr-6">
    <p className="text-[24px] font-bold text-gray-800">
      {new Date(date).getDate()}
    </p>
    <p className="text-[16px] text-gray-500">
      {new Date(date).toLocaleDateString("ko-KR", { weekday: "short" })}
    </p>
  </div>

  {/* 일정 리스트 */}
  <div className="flex-1">
    {schedules.map((schedule, index) => (
      <div
        key={schedule.id}
        className={`flex justify-between items-center py-3 ${
          index < schedules.length - 1 ? "border-b border-gray-200" : ""
        }`}
      >
        {/* 일정 내용 */}
        <div>
          <p className="text-[16px] font-bold text-gray-800">{schedule.title}</p>
          <p className="text-[13px] text-gray-600">{schedule.time}</p>
        </div>

        {/* 태그 버튼 */}
        <button
          className={`px-3 py-1 text-sm rounded-full text-white ${
            schedule.tag === "진료"
              ? "bg-primary-200"
              : schedule.tag === "재활"
              ? "bg-primary-300"
              : "bg-primary-400"
          }`}
        >
          #{schedule.tag}
        </button>
      </div>
    ))}
  </div>
</div>

  );
};

const PatientSchedular: React.FC = () => {
  const [scheduleData] = useState<Schedule[]>([
    {
      id: 1,
      title: "진료",
      date: "2025-01-16",
      time: "오전 12:00 - 오전 2:00 (2시간)",
      doctor: "김의사",
      location: "2진료실",
      tag: "진료",
    },
    {
      id: 2,
      title: "재활 치료",
      date: "2025-01-18",
      time: "오후 6:00 - 오후 7:00 (1시간)",
      doctor: "김의사",
      location: "2진료실",
      tag: "재활",
    },
    {
      id: 3,
      title: "계실염 수술",
      date: "2025-01-16",
      time: "오전 12:00 - 오전 2:00 (2시간)",
      doctor: "박의사",
      location: "수술실",
      tag: "수술",
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [showAllSchedules, setShowAllSchedules] = useState(false);

  const groupedSchedules = scheduleData.reduce(
    (acc, schedule) => {
      acc.push({ date: schedule.date, hasSchedule: true });
      return acc;
    },
    [] as { date: string; hasSchedule: boolean }[]
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      {/* 상단 헤더 */}
      <div className="flex items-center p-2 border-b border-gray-200">
        <Link to="/patient-main">
          <img src="/icons/back-icon.png" className="w-[28px]" alt="뒤로가기" />
        </Link>
        <p className="text-[20px] font-bold mx-4">2024년 12월</p>
        <img src="/icons/main-page-logo.png" className="ml-auto w-[25%]" alt="로고" />
      </div>


      {/* 전체 보기 버튼
      <div className="flex justify-between items-center my-2">
        <button
          onClick={() => setShowAllSchedules(!showAllSchedules)}
          className="px-4 py-2 bg-primary-200 text-white text-sm rounded-md shadow-sm hover:bg-primray-300 transition"
        >
          {showAllSchedules ? "주별 보기" : "전체 보기"}
        </button>
      </div> */}

      {/* 캘린더 영역 */}
      <div className="w-full my-3">
        <WeekCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          schedules={groupedSchedules}
        />
      </div>

      {/* 날짜별 일정 렌더링 */}
      <div>
        {scheduleData
          .filter((schedule) => schedule.date === selectedDate)
          .map((schedule) => (
            <ScheduleGroup
              key={schedule.id}
              date={schedule.date}
              schedules={[schedule]}
            />
          ))}
      </div>
    </div>
  );
};

export default PatientSchedular;
