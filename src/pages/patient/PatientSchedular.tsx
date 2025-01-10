import React, { useState } from "react";
import { Link } from "react-router-dom";
import "react-calendar/dist/Calendar.css"; // 기본 스타일
import ScheduleToday from "./ScheduleToday";

interface Schedule {
  id: number;
  title: string;
  time: string;
  doctor: string;
  location: string;
  tag: string;
}

const PatientSchedular: React.FC = () => {
  const currentDate = new Date();

  // 현재 년도와 월 가져오기
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // 일정 데이터
  const [scheduleData] = useState<Schedule[]>([
    {
      id: 1,
      title: "진료",
      time: "오후 12:00 - 오후 2:00 (2시간)",
      doctor: "김의사",
      location: "2진료실",
      tag: "진료",
    },
    {
      id: 2,
      title: "재활 치료",
      time: "오후 6:00 - 오후 7:00 (1시간)",
      doctor: "김의사",
      location: "2진료실",
      tag: "재활",
    },
    {
      id: 3,
      title: "수술",
      time: "오전 9:00 - 오후 12:00 (3시간)",
      doctor: "박의사",
      location: "수술실",
      tag: "수술",
    },
  ]);

  // 태그 상태 관리
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 오늘의 일정 슬라이드 오버레이 표시 여부
  const [isTodayScheduleOpen, setTodayScheduleOpen] = useState(false);

  // 태그 클릭 이벤트
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag)); // 선택 해제
    } else {
      setSelectedTags([...selectedTags, tag]); // 선택 추가
    }
  };

  // 오늘의 일정 열기
  const handleOpenTodaySchedule = () => {
    setTodayScheduleOpen(true);
  };

  // 오늘의 일정 닫기
  const handleCloseTodaySchedule = () => {
    setTodayScheduleOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-3">
      {/* main logo */}
      <div className="flex items-center p-2">
        <Link to="/patient-main">
          <img src="/icons/back-icon.png" className="w-[28px]" />
        </Link>

        <p className="text-[20px] font-bold">
          {currentYear}년 {currentMonth}월
        </p>
        <img src="/icons/main-page-logo.png" className="ml-auto w-[25%]"></img>
      </div>

      <div className="border w-full h-[70px] mb-4">
        {/* calendar here */} calendar
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleOpenTodaySchedule}
      >
        오늘의 일정(임시버튼)
      </button>

      {/* 우선 한 개만 연결 (테스트용) */}
      <div className="border rounded-[20px] w-full h-[140px] shadow-lg mt-2"></div>

      {/* 오늘의 일정 슬라이드 */}
      {isTodayScheduleOpen && (
        <ScheduleToday
          onClose={handleCloseTodaySchedule}
          scheduleData={scheduleData}
          selectedTags={selectedTags}
          onTagClick={handleTagClick}
        />
      )}
    </div>
  );
};

export default PatientSchedular;
