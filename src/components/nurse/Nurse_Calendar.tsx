import React from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

const NurseCalendar = () => {
  return (
    <div className="p-4 bg-gray-100 h-screen overflow-hidden">
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        allDaySlot={false}
        headerToolbar={{
          start: "prev,next",
          center: "",
          end: "",
        }}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        slotLabelInterval="01:00:00"
        slotDuration="01:00:00"
        height="100%"
        contentHeight="auto"
        dayHeaderFormat={{ weekday: "short", month: "numeric", day: "numeric" }}
        firstDay={1}
        dayHeaderContent={(arg) => {
          const day = arg.date.getDay();
          const isSunday = day === 0;
          const isSaturday = day === 6;

          return (
            <div
              className={`flex flex-col items-center justify-center font-bold py-1 ${
                isSunday
                  ? "text-red-600"
                  : isSaturday
                  ? "text-blue-600"
                  : "text-black"
              }`}
            >
              <span className="text-sm font-semibold">
                {arg.date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-lg font-bold">
                {arg.date.toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                })}
              </span>
            </div>
          );
        }}
        events={[
          {
            title: "수술",
            start: "2025-01-22T07:00:00",
            end: "2025-01-22T09:00:00",
            extendedProps: {
              patientName: "홍길동",
              detail: "환자 수술",
            },
            className: "bg-red-200 text-red-800 p-2 border-l-4 border-red-600",
          },
          {
            title: "진료",
            start: "2025-01-22T12:00:00",
            end: "2025-01-22T13:00:00",
            extendedProps: {
              patientName: "홍길동",
              detail: "정기 진료",
            },
            className: "bg-blue-200 text-blue-800 rounded-md shadow-md p-2 border-l-4 border-blue-600",
          },
        ]}
        slotLabelClassNames="text-gray-600 text-sm font-semibold"
        slotLaneClassNames="bg-gray-50 border-b border-gray-200"
        eventContent={(eventInfo) => {
          const { event } = eventInfo;
          const { patientName, detail } = event.extendedProps;

          return (
            <div className="text-left p-1">
              <span className="block font-semibold">{event.title}</span>
              <span className="block text-sm text-gray-600">{patientName}</span>
              <span className="block text-xs text-gray-500">{detail}</span>
            </div>
          );
        }}
      />
    </div>
  );
};

export default NurseCalendar;
