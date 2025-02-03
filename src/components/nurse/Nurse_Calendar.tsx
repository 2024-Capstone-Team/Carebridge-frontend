import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";

interface Schedule {
  id: number;
  patientId: string;
  medicalStaffId: number;
  scheduleDate: string;
  details: string;
  category: string;
}


const NurseCalendar = () => {
  const [events, setEvents] = useState<any[]>([]); // 캘린더 이벤트 상태
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null); // 선택된 이벤트
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 상태
  const navigate = useNavigate(); 


  // API 호출
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const patientId = 1;
        const response = await axios.get(
          `http://localhost:8080/api/schedule/patient/${patientId}`
        );

        // API 응답 데이터를 캘린더 이벤트 형식으로 변환
        const fetchedEvents = response.data.map((schedule: Schedule) => ({
          id: schedule.id,
          title: schedule.category, 
          time: schedule.scheduleDate, 
          extendedProps: {
            patientId: schedule.patientId,
            detail: schedule.details,
          },
          className:
            schedule.category === "수술"
              ? "bg-red-200 text-red-800 border-l-4 border-red-600"
              : "bg-blue-200 text-blue-800 border-l-4 border-blue-600",
        }));

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("스케줄 데이터를 가져오는 중 에러 발생:", error);
      }
    };

    fetchSchedules();
  }, []);


  // 이벤트 클릭 핸들러
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start?.toLocaleString(),
      detail: event.extendedProps.detail,
    });
    setIsPopupOpen(true); // 팝업 열기
  };

  // 팝업 닫기
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedEvent(null);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      navigate("/schedule/edit", { state: selectedEvent }); // Nurse_ScheduleEdit 컴포넌트로 데이터 전달
    }
  };


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
        events={events}
        slotLabelClassNames="text-gray-600 text-sm font-semibold"
        slotLaneClassNames="bg-gray-50 border-b border-gray-200"
        eventContent={(eventInfo) => {
          const { event } = eventInfo;
          const { detail } = event.extendedProps;

          return (
            <div className="text-left p-1">
              <p className="! text-black text-[15px] font-semibold">{event.title}</p>
              <p className="text-xs text-black">{detail}</p>
            </div>
          );
        }}
      />

      {/* 팝업 */}
      {isPopupOpen && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">{selectedEvent.title} 상세 정보</h2>
            <p className="text-sm mb-2">
              <strong>일시:</strong> {selectedEvent.start}
            </p>

            <p className="text-sm mb-2">
              <strong>내용:</strong> {selectedEvent.detail}
            </p>

            <div className="flex justify-end mt-4">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded mr-2" onClick={closePopup}>
                닫기
              </button>
              
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleEdit}>
                수정
              </button>

              <button className="bg-red-500 text-white px-4 py-2 rounded ml-2" onClick={() => alert("추후 구현")}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseCalendar;
