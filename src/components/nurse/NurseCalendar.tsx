  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import FullCalendar from "@fullcalendar/react";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import axios from "axios";
  import { useUserContext } from "../../context/UserContext";
  import { formatBirthdate, formatGender, calculateAge } from "../../utils/commonUtils";

  interface ExaminationSchedule {
    id: number;
    patientId: number;
    medicalStaffId: number;
    scheduleDate: string;
    details: string;
    category: string;
    patientName: string;
    birthDate: string;
    gender: string;
    age: number;
  }

  const NurseCalendar: React.FC<{ onEdit: (scheduleId: string) => void }> = ({ onEdit }) => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const [events, setEvents] = useState<any[]>([]); // 캘린더 이벤트 상태
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null); // 선택된 이벤트
    const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 상태
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    const { hospitalId } = useUserContext();
    const staffId = 1;
    
    // 만 나이 계산
    const calculateAge = (birthDateString: string): number => {
      const today = new Date();
      const birthDate = new Date(birthDateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const isBeforeBirthday =
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

      if (isBeforeBirthday) {
        age--;
      }
      return age;
    };
    
    // 일정 API
    const fetchSchedules = async () => {
      try {
        const response = await axios.get<ExaminationSchedule[]>(`${API_BASE_URL}/api/schedule/medical-staff/${staffId}`);
        console.log("API Response:", response.data);

        // 환자 상세 정보 API
        const schedulesWithPatientDetails = await Promise.all(
          response.data.map(async (schedule) => {
            try {
              const patientResponse = await axios.get(`${API_BASE_URL}/api/patient/user/${schedule.patientId}`);
              const patient = patientResponse.data;
              return {
                ...schedule,
                patientName: patient.name,
                birthDate: formatBirthdate(patient.birthDate),
                gender: formatGender(patient.gender),
                age: calculateAge(patient.birthDate),
              };
            } catch (error) {
              console.error(`환자 ${schedule.patientId} 정보 호출 에러:`, error);
              return schedule;
            }
          })
        );
        
        // category별로 duration 반환
        function getDurationByCategory(category: string): number {
          switch (category) {
            case "SURGERY":
              return 60;
            case "OUTPATIENT":
            case "EXAMINATION":
              return 30;
            default:
              return 20; 
          }
        }
        
        const fetchedEvents = schedulesWithPatientDetails.map((schedule) => {
        const startDate = new Date(schedule.scheduleDate);

        // duration 구하기
        const durationMinutes = getDurationByCategory(schedule.category);

        // endDate = startDate + durationMinutes
        const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    
        return {
          id: schedule.id,
          title: schedule.category,
          start: startDate,
          end: endDate,
          allDay: false,
          backgroundColor: "#D3E1FA",
          borderColor: "transparent",
          extendedProps: {
            details: schedule.details,
            patientName: schedule.patientName,
            birthDate: schedule.birthDate,
            gender: schedule.gender,
            age: schedule.age,
          },
        };
      });
    
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("스케줄 데이터를 가져오는 중 에러 발생:", error);
      setError("스케줄 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);
  
  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const rect = clickInfo.el.getBoundingClientRect();
    setPopupPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    
    // 선택된 이벤트 데이터 설정
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start?.toLocaleString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      patientName: event.extendedProps.patientName,
      birthDate: event.extendedProps.birthDate,
      gender: event.extendedProps.gender,
      age: event.extendedProps.age,
      details: event.extendedProps.details,
    });
    setIsPopupOpen(true);
  };
  
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedEvent(null);
    setPopupPosition(null);
    };

   const handleEdit = () => {
    if (selectedEvent) {
      onEdit(selectedEvent.id); // scheduleId 전달
    }
  };
  
  const handleDelete = async () => {
    if (!selectedEvent) return;

    const confirmResult = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmResult) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/schedule/${selectedEvent.id}`);
      alert("스케줄이 삭제되었습니다.");
      closePopup();
      
      // 삭제 후 일정 다시 불러오기
      fetchSchedules();
    } catch (error) {
      console.error("스케줄 삭제 실패:", error);
      alert("스케줄 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
      <div className="bg-white height h-full py-4 flex flex-col rounded-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <FullCalendar
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            allDaySlot={false}
            headerToolbar={false}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            }}
            eventOverlap={false}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotLabelInterval="01:00:00"
            slotDuration="00:20:00"
            stickyHeaderDates={true}
            height="100%"
            contentHeight="auto"
            dayHeaderFormat={{ weekday: "short", month: "numeric", day: "numeric" }} // 날짜 표시
            firstDay={1}
            dayHeaderContent={(arg) => {
              const day = arg.date.getDay();
              const isSunday = day === 0;
              const isSaturday = day === 6;
              
              return (
              <div
                className={`flex flex-col items-center justify-center font-bold py-1 ${
                  isSunday ? "text-red-600" : isSaturday ? "text-blue-600" : "text-black"}`}
              >
                <span style={{ fontSize: "var(--font-body)" }}>
                  {arg.date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="font-bold" style={{ fontSize: "var(--font-title)" }}>
                  {arg.date.toLocaleDateString("en-US", { month: "numeric", day: "numeric",})}
                </span>
              </div>
            );
          }}
          events={events}
          eventClick={handleEventClick}
          slotLabelClassNames="text-gray-600 text-sm font-semibold leading-loose py-2" // 시간 영역
          slotLaneClassNames="bg-white leading-loose py-2" // 내용 영역
          dayHeaderClassNames="bg-white text-black"
          eventContent={(eventInfo) => {
            const { event } = eventInfo;
            const { details, patientName } = event.extendedProps;

            return (
              <div className="p-1">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="text-black" style={{ fontSize: "var(--font-caption)" }}>
                      {new Date(event.start!).toLocaleTimeString("ko-KR", { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: false 
                        })}
                    </span>
                    <span className="text-black text-[15px] font-semibold">
                      {event.title}
                    </span>
                  </div>
                  <div className="flex justify-end items-center">
                      <span className="text-black text-right font-semibold mr-1" style={{ fontSize: "var(--font-body)" }}>{patientName}</span>
                      <span className="text-black" style={{ fontSize: "var(--font-caption)" }}>환자</span>
                    </div>
                </div>
              </div>
            );
          }}
        />
        </div>

        {/* 팝업 */}
        {isPopupOpen && selectedEvent && popupPosition && (
          <div className="fixed flex items-center justify-center bg-transparent z-50"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,}}
            >
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <span className="font-bold mb-1 mr-2" style={{ fontSize: "var(--font-title)" }}>{selectedEvent.patientName}</span>
                  <span style={{ fontSize: "var(--font-body)" }}>환자</span>
                  </div>
                <button onClick={closePopup} className="px-1 text-black hover:text-gray-400">
                  ✖
                </button>
              </div>
              <hr className="border-gray-400 mb-4"></hr>

              <p>
                <span className="text-[15px] text-gray-500 pr-3">인적사항</span> 
                <span className="text-[15px] pr-2">{selectedEvent.birthDate}</span>
                <span className="text-[15px] pr-2">만 {selectedEvent.age}세</span>
                <span className="text-[15px] pr-2">{selectedEvent.gender}</span>
              </p>

              <p>
                <span className="text-[15px] text-gray-500 pr-9">일시 </span> 
                <span className="text-[15px]">{selectedEvent.start}</span>
              </p>

              <p>
                <span className="text-[15px] text-gray-500 pr-10">일정</span>
                <span className="text-[15px]">{selectedEvent.title}</span>
              </p>

              <div className="flex justify-center mt-4">
                <button 
                  className="px-3 py-1 text-lg font-medium rounded-md whitespace-nowrap transition-all duration-200 bg-[#E3E3E3] border border-[#F8F8F8] hover:bg-gray-200"  
                  onClick={handleDelete}>
                  삭제
                </button>
                <button 
                  className="px-3 py-1 text-lg font-medium rounded-md whitespace-nowrap transition-all duration-200 bg-[#F8F8F8] border border-[#E3E3E3] hover:bg-gray-200" 
                  onClick={handleEdit}>
                  수정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default NurseCalendar;
