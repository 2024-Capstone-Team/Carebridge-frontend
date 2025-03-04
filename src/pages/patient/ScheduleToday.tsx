//ScheduleToday.tsx

import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

interface Schedule {
  id: number;
  title: string;
  time: string;
  doctor: string;
  location: string;
  tag: string;
}

interface ScheduleTodayProps {
  onClose: () => void;
  scheduleData: Schedule[];
  selectedTags: string[];
  onTagClick: (tag: string) => void;
}

const ScheduleToday: React.FC<ScheduleTodayProps> = ({
  onClose,
  scheduleData,
  selectedTags,
  onTagClick,
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 필터링된 데이터 계산
  const filteredSchedules = selectedTags.length
    ? scheduleData.filter((schedule) => selectedTags.includes(schedule.tag))
    : scheduleData; // 태그가 선택되지 않았으면 전체 표시

  return (
    <main>
      
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-10"
        onClick={onClose}
      ></div>

      {/* 오늘의 일정 */}
      <div className="fixed bottom-0 w-[93%] bg-white h-[80vh] z-20 transition-transform duration-500 transform translate-y-0 shadow-lg rounded-t-xl">
        {/* header */}
        <div className="flex flex-row p-4 items-center">
          <h2 className="text-xl font-bold">오늘의 일정</h2>
          {/* 오늘의 일정 개수 */}
          <p className="ml-2 font-bold text-primary-300">
            {scheduleData.length} {/*Data 개수 불러오기*/}
          </p>
        </div>
        <div>
          {/* 일정 목록 */}
          <div>
            {filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="border-b p-4 flex items-start justify-between"
              >
                <div>
                  <div className="flex flex-rows items-center">
                    <h2 className="font-bold">{schedule.title}</h2>
                    <p className="text-[12px] text-gray-400 pl-2">
                      {schedule.time}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    담당: {schedule.doctor}
                  </p>
                  <p className="text-sm text-gray-500">
                    장소: {schedule.location}
                  </p>
                </div>
                <div className="p-4">
                  <span className="bg-primary-300 text-white px-2 py-1 text-sm rounded-full">
                    #{schedule.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* 태그 필터 */}
          <div className="fixed bottom-0 left-0 w-full bg-gray-100 p-4 shadow-lg items-center justify-between">
            <span className="text-gray-500 text-sm flex items-center pb-3">
              <img src="/icons/filter-icon.png" className="pr-2"></img>
              <span className="mr-2">태그별 보기</span>
            </span>
            <div className="flex gap-2">
              {["진료", "재활", "수술"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag)
                      ? "bg-primary-300 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ScheduleToday;
