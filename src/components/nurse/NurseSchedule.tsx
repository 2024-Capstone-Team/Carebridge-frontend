import React, {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const NurseSchedule: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ExaminationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null); // 팝업 내용
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null); // 팝업 위치

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/nurse-schedule"); // NurseSchedulePage로 이동
  };

  const handleScheduleAdd = () => {
    // NurseSchedulePage로 이동하면서 state에 view: 'add' 전달
    navigate("/nurse-schedule", { state: { view: "add" } });
  };

  const handleEditSchedule = (id: number) => {
    navigate(`/edit-schedule/${id}`); // "수정" 버튼 클릭 시 이동할 경로
  };

  const handleMouseEnter = (schedule: ExaminationSchedule, event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect(); // 요소의 위치와 크기 가져오기
    setTooltipPosition({ x: rect.left, y: rect.bottom }); // 요소의 아래쪽으로 위치 설정

    // HTML 기반으로 팝업 내용 구성
    setTooltipContent(
      `<div>
         <div class="font-semibold text-[15px] text-black">${schedule.category}</div>
         <div class="text-[13px] text-gray-500">${schedule.patientName}</div>
         <div class="text-[13px] text-gray-500">
          <span>${schedule.birthDate}</span>
          <span>만 ${schedule.age}세</span>
          <span>${schedule.gender}</span>
         </div>
         <div class="text-[13px] text-gray-500">
         <span>${new Date(schedule.scheduleDate).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span><br />
         </div>
       </div>`
    );
  }

  const handleMouseLeave = () => {
    setTooltipContent(null);
    setTooltipPosition(null);
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

  // 만 나이 계산
  const calculateAge = (birthDateString: string): number => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
  
    // 생일이 지났는지 확인
    const isBeforeBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  
    if (isBeforeBirthday) {
      age--;
    }
    return age;
  };
  


  // 성별 변환 함수
  const formatGender = (gender: string | undefined) => {
    if (!gender) return "정보 없음"; // 값이 없을 경우 처리
    return gender === "Male" ? "남" : gender === "Female" ? "여" : "정보 없음";
  };

  // API 호출
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

      const today = new Date();
      const todayDateString = today.toISOString().split("T")[0];

      // 스케줄 데이터에 환자 정보 추가 및 오늘 날짜 필터링
      const schedulesWithNames = response.data
        .map((schedule) => ({
          ...schedule,
          patientName,
          birthDate,
          gender,
          age,
        }))
        .filter((schedule) => schedule.scheduleDate.startsWith(todayDateString)) // 오늘 날짜 필터링
        .sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime()); // 시간 순 정렬

      setScheduleData(schedulesWithNames);
    } catch (err) {
      console.error("API 호출 에러:", err); // 에러 객체 출력
      setError("일정을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);


  const currentDate = new Date(); // 현재 날짜 표시
  const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    /*스케줄러 전체 영역*/
    <div className="flex flex-col bg-[#DFE6EC] rounded-lg p-4 max-h-full cursor-pointer" onClick={handleNavigate}>
      
      {/*스케줄 영역*/}
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">스케줄</h2>
      </div>

      {/*날짜, + 버튼 영역*/}
      <div className="flex items-center justify-between">
        <span className="text-[17px] text-black font-semibold">{formattedDate}</span>
        <button className="bg-transparent px-4 py-2" onClick={handleScheduleAdd}>+</button>
      </div>

      <div className="flex-grow overflow-y-auto">
        <ul className="space-y-3">
          {scheduleData.length > 0 ? (
            scheduleData.map((schedule) => {
              const scheduleTime = new Date(schedule.scheduleDate).toLocaleTimeString(
                "ko-KR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );
              
              return (
                <li key={schedule.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-md"
                onMouseEnter={(event) => handleMouseEnter(schedule, event)} onMouseLeave={handleMouseLeave}>
                  <div>
                    <div>
                      <span className="font-semibold text-[15px] text-gray-800 mr-1">{schedule.category}</span>
                      <span className="text-[12px] text-gray-800">{scheduleTime}</span>
                    </div>

                    <div>
                      <span className="text-[14px] text-gray-500 mr-1">{schedule.patientName}</span>
                      <span className="text-[12px] text-gray-500">환자</span>
                    </div>
                  </div>
                  <button className="text-[11px] text-gray-500" onClick={() => handleEditSchedule(schedule.id)}>
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
        <div className="absolute bg-white p-3 rounded-lg shadow-lg text-sm text-gray-800"
          style={{
            top: tooltipPosition.y - 30, 
            left: tooltipPosition.x + 10,
            minWidth: "200px",
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }} // HTML 렌더링
          />
      )}
      </div>
      );
    };

export default NurseSchedule;
