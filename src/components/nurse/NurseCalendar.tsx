  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import FullCalendar from "@fullcalendar/react";
  import timeGridPlugin from "@fullcalendar/timegrid";
  // import "../../App.css";
  import axios from "axios";

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
    const [events, setEvents] = useState<any[]>([]); // 캘린더 이벤트 상태
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null); // 선택된 이벤트
    const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 상태
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
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

  // 생년월일 포맷 변환 함수
  const formatBirthdate = (birthdate: string | null | undefined) => {
    if (!birthdate) return "정보 없음";

    try {
      const trimmedDate = birthdate.split("T")[0];
      const [year, month, day] = trimmedDate.split("-");
      if (year && month && day) {
        return `${year}.${month}.${day}`;
      }
      return "정보 없음";
    } catch (error) {
      console.error("formatBirthdate 처리 중 에러:", error);
      return "정보 없음";
    }
  };

  const formatGender = (gender: string): string => {
    return gender === "Male" ? "남" : gender === "Female" ? "여" : "정보 없음";
  };

  // 일정 API
  const fetchSchedules = async () => {
    try {
      const staffId = 1; // 임시 의료진 id
      const response = await axios.get<ExaminationSchedule[]>(`http://localhost:8080/api/schedule/medical-staff/${staffId}`);
      console.log("API Response:", response.data);

      // 환자 상세 정보 API
      const schedulesWithPatientDetails = await Promise.all(
        response.data.map(async (schedule) => {
          try {
            const patientResponse = await axios.get(`http://localhost:8080/api/patient/user/${schedule.patientId}`);
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

      // category별로 duration(분 단위) 반환
      function getDurationByCategory(category: string): number {
        switch (category) {
          case "SURGERY":
            return 60;
          case "OUTPATIENT":
            return 30;
          case "EXAMINATION":
            return 15;
          default:
            return 20; // 기타 카테고리는 20분으로 처리
        }
      }

      const fetchedEvents = schedulesWithPatientDetails.map((schedule) => {
        const startDate = new Date(schedule.scheduleDate);

        // 1) 카테고리에 맞는 분 단위 duration 구하기
        const durationMinutes = getDurationByCategory(schedule.category);

        // 2) endDate = startDate + durationMinutes
        const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    
        return {
          id: schedule.id,
          title: schedule.category,
          start: startDate,
          end: endDate,
          allDay: false,
          backgroundColor: "transparent",
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
      setIsPopupOpen(true); // 팝업 열기
    };

    // 팝업 닫기
    const closePopup = () => {
      setIsPopupOpen(false);
      setSelectedEvent(null);
      setPopupPosition(null);
      };

    const handleEdit = () => {
      if (selectedEvent) {
        onEdit(selectedEvent.id); // scheduleId를 전달
      }
    };


    return (
      <div className="height h-full py-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <FullCalendar
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            allDaySlot={false}
            headerToolbar={{
              left: "prev,today,next",   // 왼쪽 영역에 '이전주', '오늘', '다음주' 버튼
              center: "title",           // 중앙에는 현재 날짜 범위 타이틀
              right: "timeGridWeek,timeGridDay" // 오른쪽에는 '주간/일간' 전환 버튼
            }}
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
                <span className="text-[15px]">
                  {arg.date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-[22px] font-bold">
                  {arg.date.toLocaleDateString("en-US", { month: "numeric", day: "numeric",})}
                </span>
              </div>
            );
          }}
          events={events}
          eventClick={handleEventClick}
          slotLabelClassNames="text-gray-600 text-sm font-semibold leading-loose py-2" // 시간 영역
          slotLaneClassNames="bg-gray-50 leading-loose py-2" // 내용 영역
          eventContent={(eventInfo) => {
            const { event } = eventInfo;
            const { details, patientName } = event.extendedProps;

            return (
              <div className="bg-[#D3E1FA] p-1">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-black text-[13px]">
                      {new Date(event.start!).toLocaleTimeString("ko-KR", { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: false 
                        })}
                    </span>
                    <span className="text-black text-[13px] font-semibold">
                      {event.title}
                    </span>
                  </div>
                  <div className="flex justify-end items-center">
                      <span className="text-black text-[15px] text-right font-semibold mr-1">{patientName}</span>
                      <span className="text-black text-[11px]">환자</span>
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
              <span className="text-[20px] font-bold mb-1 mr-2">{selectedEvent.patientName}</span>
              <span className="text-[15px]">환자</span>
              <button onClick={closePopup} className="px-1 text-black hover:bg-gray-300">
                ✖
              </button>
              <hr className="border-gray-400 mb-4"></hr>

              <p>
                <span className="text-[15px] text-gray-400 pr-3">인적사항</span> 
                <span className="text-[15px] pr-2">{selectedEvent.birthDate}</span>
                <span className="text-[15px] pr-2">만 {selectedEvent.age}세</span>
                <span className="text-[15px] pr-2">{selectedEvent.gender}</span>
              </p>

              <p>
                <span className="text-[15px] text-gray-400 pr-9">일시 </span> 
                <span className="text-[15px]">{selectedEvent.start}</span>
              </p>

              <p>
                <span className="text-[15px] text-gray-400 pr-10">일정</span>
                <span className="text-[15px]">{selectedEvent.title}</span>
              </p>

              <div className="flex justify-center mt-4">
              <button className="bg-gray-300 border border-gray-400 rounded-md shadow-md text-center mx-1 w-[60px] h-[35px]" onClick={() => alert("추후 구현")}>
                  삭제
                </button>
                <button className="border border-gray-300 rounded-md shadow-md text-center mx-1 w-[60px] h-[35px]" onClick={handleEdit}>
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
