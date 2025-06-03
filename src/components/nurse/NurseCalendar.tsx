  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import FullCalendar from "@fullcalendar/react";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import { FiX } from "react-icons/fi";
  import axios from "axios";
  import { useUserContext } from "../../context/UserContext";
  import { formatBirthdate, formatGender, calculateAge } from "../../utils/commonUtils";
  import Button from "../common/Button";

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
              return 90; // 수술 90분
            case "OUTPATIENT":
              return 50; // 외래 50분
            case "EXAMINATION":
              return 60; // 검사 60분
            default:
              return 30;
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
    <div className="bg-white height h-full py-6 px-4 flex flex-col rounded-xl overflow-hidden shadow-sm">
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
          eventOverlap={true}
          slotEventOverlap={false}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotLabelInterval="01:00:00"
          slotDuration="00:30:00"
          stickyHeaderDates={true}
          height="100%"
          contentHeight="auto"
          dayHeaderFormat={{ weekday: "short", month: "numeric", day: "numeric" }}
          firstDay={1}
          eventMinHeight={35}
          dayMaxEvents={false}
          expandRows={true}
          dayHeaderContent={(arg) => {
            const day = arg.date.getDay();
            const isSunday = day === 0;
            const isSaturday = day === 6;
            
            return (
              <div
                className={`flex flex-col items-center justify-center font-bold py-2 ${
                  isSunday ? "text-red-500" : isSaturday ? "text-blue-500" : "text-gray-700"
                }`}
              >
                <span className="text-sm font-bold mb-1">
                  {arg.date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-lg font-bold">
                  {arg.date.toLocaleDateString("en-US", { day: "numeric" })}
                </span>
              </div>
            );
          }}
          events={events}
          eventClick={handleEventClick}
          slotLabelClassNames="text-gray-500 text-sm font-medium px-2"
          slotLaneClassNames="bg-white hover:bg-gray-50 transition-colors duration-150 h-[100px]"
          dayHeaderClassNames="bg-white border-b border-gray-100 py-3"
          eventClassNames="rounded-lg shadow-sm transition-transform duration-150 hover:transform hover:scale-[1.02]"
          eventContent={(eventInfo) => {
            const { event } = eventInfo;
            const { details, patientName } = event.extendedProps;

            let categoryColor;
            switch (event.title) {
              case "SURGERY":
                categoryColor = "bg-blue-100 border-l-4 border-blue-500";
                break;
              case "OUTPATIENT":
                categoryColor = "bg-green-100 border-l-4 border-green-500";
                break;
              case "EXAMINATION":
                categoryColor = "bg-purple-100 border-l-4 border-purple-500";
                break;
              default:
                categoryColor = "bg-gray-100 border-l-4 border-gray-500";
            }

            return (
              <div className={`p-1 h-full ${categoryColor} overflow-hidden`}>
                <div className="flex flex-col h-full justify-between min-h-[32px] gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                      {new Date(event.start!).toLocaleTimeString("ko-KR", { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: false 
                      })}
                    </span>
                    <span className="text-xs font-semibold text-gray-800 truncate ml-1">
                      {event.title === "SURGERY" ? "수술" :
                       event.title === "OUTPATIENT" ? "외래" :
                       event.title === "EXAMINATION" ? "검사" : event.title}
                    </span>
                  </div>
                  <div className="flex justify-end items-center overflow-hidden">
                    <span className="text-xs font-medium text-gray-700 truncate">{patientName}</span>
                    <span className="text-xs text-gray-500 ml-0.5 whitespace-nowrap">환자</span>
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
            left: `${popupPosition.left}px`,
          }}>
          <div className="bg-white p-5 rounded-xl shadow-xl w-80 border border-gray-100">
            {/* 헤더 영역 */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedEvent.patientName}</h3>
                <div className="flex items-center text-gray-500 text-xs">
                  <span className="mr-1">{selectedEvent.birthDate}</span>
                  <span>•</span>
                  <span className="mr-1">만 {selectedEvent.age}세</span>
                  <span>•</span>
                  <span>{selectedEvent.gender}</span>
                </div>
              </div>
              <button 
                onClick={closePopup} 
                className="px-1 text-black hover:text-gray-500"
              >
                <FiX />
              </button>
            </div>

            {/* 일정 정보 */}
            <div className="bg-gray-50 rounded-lg mb-2">
              <div className="flex items-center mb-2">
                <div className="w-16 text-gray-500 text-xs">일시</div>
                <div className="flex-1 text-gray-900 text-sm font-medium">
                  {selectedEvent.start}
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-16 text-gray-500 text-xs">일정</div>
                <div className="flex-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                    ${selectedEvent.title === "SURGERY" ? "bg-blue-100 text-blue-700" :
                      selectedEvent.title === "OUTPATIENT" ? "bg-green-100 text-green-700" :
                      selectedEvent.title === "EXAMINATION" ? "bg-purple-100 text-purple-700" :
                      "bg-gray-100 text-gray-700"}`}
                  >
                    {selectedEvent.title === "SURGERY" ? "수술" :
                     selectedEvent.title === "OUTPATIENT" ? "외래" :
                     selectedEvent.title === "EXAMINATION" ? "검사" : selectedEvent.title}
                  </span>
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end space-x-3">
              <Button 
                onClick={handleEdit}
                variant="edit"
              >
                수정
              </Button>
              
              <Button 
                onClick={handleDelete}
                variant="delete"
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseCalendar;
