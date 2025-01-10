import React, { useState } from "react";

interface Schedule {
  date: string;
  time: string;
  title: string;
  patient: string;
}

const NurseCalendar: React.FC = () => {
  const [schedules] = useState<Schedule[]>([
    { date: "12/2", time: "07:00", title: "수술", patient: "홍길동" },
    { date: "12/2", time: "07:10", title: "진료", patient: "홍길동" },
    { date: "12/4", time: "12:00", title: "수술", patient: "홍길동" },
    { date: "12/7", time: "12:10", title: "진료", patient: "홍길동" },
  ]);

  const days = ["Mon 12/2", "Tue 12/3", "Wed 12/4", "Thu 12/5", "Fri 12/6", "Sat 12/7", "Sun 12/8"];

  return (
    <div className="calendar w-full">
      <h2 className="font-semibold text-black">스케줄러</h2>
      <div className="calendar-grid">
        {days.map((day, index) => (
          <div key={index} className="day-column">
            <h3>{day}</h3>
            {schedules
              .filter((schedule) => schedule.date === day.split(" ")[1])
              .map((schedule, idx) => (
                <div key={idx} className="schedule-item">
                  <span className="schedule-time">{schedule.time}</span>
                  <span className="schedule-title">{schedule.title}</span>
                  <span className="schedule-patient">{schedule.patient}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NurseCalendar;
