import React from "react";
import dayjs from "dayjs";

interface WeekCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  schedules: { date: string; hasSchedule: boolean }[]; // 일정 여부를 전달
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedDate,
  onDateSelect,
  schedules,
}) => {
  const getWeekDays = (): string[] => {
    const today = dayjs(selectedDate);
    const startOfWeek = today.startOf("week"); // 주의 시작 (일요일)
    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, "day").format("YYYY-MM-DD")
    );
  };

  const weekDays = getWeekDays();

  const handlePrevWeek = () => {
    const prevWeekStart = dayjs(selectedDate).subtract(1, "week").startOf("week");
    onDateSelect(prevWeekStart.format("YYYY-MM-DD"));
  };

  const handleNextWeek = () => {
    const nextWeekStart = dayjs(selectedDate).add(1, "week").startOf("week");
    onDateSelect(nextWeekStart.format("YYYY-MM-DD"));
  };

  return (
    <div className="flex flex-col items-center">
      {/* 주간 이동 버튼 */}
      <div className="flex justify-between w-full mb-2 text-gray-500 text-sm">
        <button
          onClick={handlePrevWeek}
          className="text-gray-600 hover:text-gray-800"
        >
          &lt;
        </button>
        <div className="flex justify-between w-full">
          {weekDays.map((date) => (
            <div key={date} className="flex-1 text-center">
              {dayjs(date).format("ddd")} {/* 요일 (일, 월, 화, ...) */}
            </div>
          ))}
        </div>
        <button
          onClick={handleNextWeek}
          className="text-gray-600 hover:text-gray-800"
        >
          &gt;
        </button>
      </div>

      {/* 날짜 표시 */}
      <div className="flex justify-between w-full">
        {weekDays.map((date) => {
          const isSelected = date === selectedDate;
          const hasSchedule = schedules.some(
            (schedule) => schedule.date === date && schedule.hasSchedule
          );

          return (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className={`flex flex-col items-center justify-center flex-1 text-center py-2 rounded-full ${
                isSelected
                  ? "bg-primary-300 text-white"
                  : "bg-transparent text-gray-800"
              }`}
            >
              <span className="text-sm">{dayjs(date).format("D")}</span>
              {hasSchedule && (
                <span className="w-1 h-1 mt-1 bg-primary-200 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
