import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "react-calendar/dist/Calendar.css"; // 기본 스타일
import dayjs from "dayjs";
import WeekCalendar from "../../components/patient/WeekCalander";
import axios from "axios";

interface Schedule {
  id: number;
  patientPhone: string;
  medicalStaffId: number;
  scheduleDate: string;
  details: string;
  code: string;
}

const PatientSchedular: React.FC = () => {
  const currentDate = dayjs().format("YYYY-MM-DD");

  // 일정 데이터
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 호출
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:8080/api/schedule/patient/01012345678"

        );
        console.log("API 응답 데이터:", response.data);
        setScheduleData(response.data);
      } catch (err) {
        console.error("Error fetching schedule data:", err);
        setError("일정을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // 날짜별로 그룹화된 일정 데이터
  const groupedSchedules = scheduleData.reduce(
    (groups: { [date: string]: Schedule[] }, schedule) => {
      const { scheduleDate } = schedule; // scheduleDate로 매핑
      if (!groups[scheduleDate]) {
        groups[scheduleDate] = [];
      }
      groups[scheduleDate].push(schedule);
      return groups;
    },
    {}
  );

  // 일정이 있는 날짜 표시 준비
  const scheduleDates = scheduleData.map((schedule) => ({
    date: schedule.scheduleDate,
    hasSchedule: true,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      {/* 상단 헤더 */}
      <div className="flex items-center p-2 border-b border-gray-200">
        <Link to="/patient-main">
          <img src="/icons/back-icon.png" className="w-[28px]" alt="뒤로가기" />
        </Link>
        <p className="text-[20px] font-bold mx-4">
          {dayjs(selectedDate).format("YYYY년 M월")}
        </p>
        <img src="/icons/main-page-logo.png" className="ml-auto w-[25%]" alt="로고" />
      </div>

      {/* 캘린더 영역 */}
      <div className="w-full py-4 px-2">
        <WeekCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          schedules={scheduleDates}
        />
      </div>

      {/* 로딩 및 에러 처리 */}
      {loading && <p>일정을 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* 일정 리스트 */}
      <div className="flex flex-col space-y-8 mt-4">
        {Object.entries(groupedSchedules)
          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()) // 날짜 순서로 정렬
          .map(([date, schedules]) => (
            <div
              key={date}
              className={`flex flex-col space-y-4 border rounded-lg p-4 bg-white shadow-md ${
                date === selectedDate ? "border-blue-500" : ""
              }`}
            >
              {/* 날짜 표시 */}
              <div className="flex flex-col items-center justify-center mr-6">
                <p className="text-[24px] font-bold text-gray-800">
                  {new Date(date).getDate()}
                </p>
                <p className="text-[16px] text-gray-500">
                  {new Date(date).toLocaleDateString("ko-KR", { weekday: "short" })}
                </p>
              </div>

              {/* 일정 아이템 */}
              {schedules.map((schedule, index) => (
                <React.Fragment key={schedule.id}>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-[16px] font-bold text-gray-800">
                        {schedule.details} {/* details로 매핑 */}
                      </p>
                      <p className="text-[13px] text-gray-600">{schedule.patientPhone}</p>
                    </div>

                    {/* 태그 버튼 */}
                    <button
                      className={`px-3 py-1 text-sm rounded-full text-white ${
                        schedule.code === "진료"
                          ? "bg-primary-200"
                          : schedule.code === "재활"
                          ? "bg-primary-300"
                          : "bg-primary-400"
                      }`}
                    >
                      #{schedule.code}
                    </button>
                  </div>
                  {index < schedules.length - 1 && <hr className="border-t border-gray-300 my-2" />}
                </React.Fragment>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default PatientSchedular;
