import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { FaPlus } from "react-icons/fa";
import { calculateAge, formatBirthdate, formatGender } from '../../utils/commonUtils.ts';

interface ExaminationSchedule {
  id: number;
  patientId: number;
  medicalStaffId: number;
  scheduleDate: string;
  details: string;
  category: string;
  name: string;
  birthDate: string;
  gender: string;
  age: number;
}

const NurseSchedule: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [scheduleData, setScheduleData] = useState<ExaminationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
  
  const { hospitalId } = useUserContext();
  const staffId = 1;
  
  const navigate = useNavigate();

  const NURSE_SCHEDULE_ROUTE = "/nurse-schedule";
  const navigateToSchedule = (state?: any) => {
    navigate(NURSE_SCHEDULE_ROUTE, { state });
  };

  const handleScheduleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToSchedule({ view: "add" });
  };
  
  const handleEditSchedule = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToSchedule({ view: "edit", scheduleId: id });
  };

  // 환자 상세 정보 팝업 표시
  const handleMouseEnter = (schedule: ExaminationSchedule, event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.bottom });
    setTooltipContent(
      `<div>
         <div class="font-semibold text-[15px] text-black">${schedule.category}</div>
         <div class="text-[13px] text-gray-500">${schedule.name}</div>
         <div class="text-[13px] text-gray-500">
           <span>${schedule.birthDate}</span>
           <span>만 ${schedule.age}세</span>
           <span>${schedule.gender}</span>
         </div>
         <div class="text-[13px] text-gray-500">
           <span>${new Date(schedule.scheduleDate).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
         </div>
       </div>`
    );
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
    setTooltipPosition(null);
  };


  // age가 number이기 때문에 만 나이 따로 계산
  const calculateAge = (birthDateString: string): number => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const isBeforeBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
    if (isBeforeBirthday) age--;
    return age;
  };


  // 스케줄 API
  const fetchSchedules = async () => {
    try {
      const scheduleResponse = await axios.get<ExaminationSchedule[]>(`${API_BASE_URL}/api/schedule/medical-staff/${staffId}`);
      const schedules = scheduleResponse.data;
      const todayDateString = new Date().toISOString().split("T")[0];
      
      // 오늘 날짜에 해당하는 일정만 필터링
      const todaysSchedules = schedules.filter(schedule =>
        schedule.scheduleDate.startsWith(todayDateString)
      );
  
      // 환자 상세 정보 API
      const schedulesWithPatientDetails = await Promise.all(
        todaysSchedules.map(async (schedule) => {
          try {
            const patientResponse = await axios.get(`${API_BASE_URL}/api/patient/user/${schedule.patientId}`);
            const patient = patientResponse.data;
            return {
              ...schedule,
              name: patient.name,
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
  
      // 시간 순서대로 정렬
      schedulesWithPatientDetails.sort(
        (a, b) =>
          new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime()
      );
      setScheduleData(schedulesWithPatientDetails);
    } catch (err) {
      console.error("API 호출 에러:", err);
      setError("일정을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col bg-[#DFE6EC] rounded-lg max-h-full cursor-pointer" onClick={() => navigateToSchedule()}>
      
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">스케줄</h2>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[17px] text-black font-semibold">{formattedDate}</span>
        <button className="bg-transparent p-2  hover:text-gray-400" onClick={handleScheduleAdd}>
          <FaPlus />
        </button>
      </div>

      <div className="flex-grow mt-2 overflow-y-auto">
        <ul className="space-y-3">
          {scheduleData.length > 0 ? (
            scheduleData.map((schedule) => {
              const scheduleTime = new Date(schedule.scheduleDate).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li
                  key={schedule.id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-md"
                  onMouseEnter={(event) => handleMouseEnter(schedule, event)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div>
                    <div>
                      <span className="font-semibold text-[15px] text-gray-800 mr-1">{schedule.category}</span>
                      <span className="text-[12px] text-gray-800">{scheduleTime}</span>
                    </div>

                    <div>
                      <span className="text-[14px] text-gray-500 mr-1">{schedule.name}</span>
                      <span className="text-[12px] text-gray-500">환자</span>
                    </div>
                  </div>

                  <button
                    className="text-[11px] text-gray-500"
                    onClick={(e) => handleEditSchedule(schedule.id, e)}
                  >
                    수정
                  </button>
                </li>
              );
            })
          ) : (
            <li className="text-center text-gray-500 mt-1">오늘 일정이 없습니다.</li>
          )}
        </ul>
      </div>

      {tooltipContent && tooltipPosition && (
        <div
          className="absolute bg-white p-3 rounded-lg shadow-lg text-sm text-gray-800"
          style={{
            top: tooltipPosition.y - 15,
            left: tooltipPosition.x + 10,
            minWidth: "200px",
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
      
    </div>
  );
};

export default NurseSchedule;
