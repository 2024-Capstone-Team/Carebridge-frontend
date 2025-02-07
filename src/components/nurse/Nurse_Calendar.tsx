  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import FullCalendar from "@fullcalendar/react";
  import timeGridPlugin from "@fullcalendar/timegrid";
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


  // 스케줄 데이터 가져오기
  const fetchSchedules = async () => {
    try {
      const patientId = 8; // 임시 id
      const response = await axios.get<ExaminationSchedule[]>(`http://localhost:8080/api/schedule/patient/${patientId}`);
      console.log("API Response:", response.data); // 데이터 확인

      //환자 데이터 가져오기
      const patientResponse = await axios.get(`http://localhost:8080/api/patient/user/${patientId}`)

      const patientName = patientResponse.data.name;
      const birthDate = formatBirthdate(patientResponse.data.birthDate);
      const gender = formatGender(patientResponse.data.gender);
      const age = calculateAge(patientResponse.data.birthDate);

      const fetchedEvents = response.data.map((schedule) => {
        return {
          id: schedule.id,
          title: schedule.category,
          start: schedule.scheduleDate,
          backgroundColor: "transparent", // 배경 제거
          borderColor: "transparent", // 테두리 제거
          extendedProps: {
            details: schedule.details,
            patientName: patientName,
            birthDate: birthDate,
            gender: gender,
            age: age,
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
        onEdit(selectedEvent.id); // `scheduleId`를 전달하여 전환
      }
    };


    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overlow-y-auto">
          <FullCalendar
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            allDaySlot={false}
            headerToolbar={{
              start: "",
              center: "",
              end: "",
            }}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotLabelInterval="01:00:00"
            slotDuration="01:00:00"
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
          slotLaneClassNames="bg-gray-50 border-b border-gray-200 leading-loose py-2" // 내용 영역
          eventContent={(eventInfo) => {
            const { event } = eventInfo;
            const { details, patientName } = event.extendedProps;

            return (
              <div className="bg-[#D3E1FA] p-2">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-black text-[13px]">
                      {new Date(event.start!).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-black text-[15px] font-semibold">{event.title}</span>
                  </div>
                  <div className="flex justify-end items-center mt-1">
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
