import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import NurseCalendar from "../../components/nurse/Nurse_Calendar";
import ScheduleEditForm from "../../components/nurse/Nurse_ScheduleEdit";
import ScheduleAdd from "../../components/nurse/Nurse_ScheduleAdd";
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";
import home from "../../assets/home.png";
import schedular from "../../assets/schedular.png";
import macro from "../../assets/macro.png";
import dwarrows from "../../assets/down arrows.png";
import qresponse from "../../assets/quick response.png";
import axios from "axios";

interface Patient {
  patientId: number;
  name: string;
  birthDate: string;
}

const NurseSchedulePage: React.FC = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [currentView, setCurrentView] = useState<"calendar" | "edit" | "add">("calendar");
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<Record<number, boolean>>(
    patients.reduce((acc, patient) => {
      acc[patient.patientId] = false;
      return acc;
    }, {} as Record<number, boolean>)
  );


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
  

  // API 호출하여 환자 데이터 가져오기
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const staffId = 1; // 임시 staff_id
        const response = await axios.get(`http://localhost:8080/api/patient/users/${staffId}`);
        console.log(response.data); // 응답 데이터 확인
        const fetchedPatients = response.data.map((patient: any) => ({
          patientId: patient.patientId,
          name: patient.name,
          birthDate: patient.birthDate,
        }));

         // 이름 기준으로 환자 정렬
         fetchedPatients.sort((a: Patient, b: Patient) => a.name.localeCompare(b.name, "ko", { sensitivity: "base" }));
         setPatients(fetchedPatients);

        const initialSelectedPatients = fetchedPatients.reduce((acc: Record<number, boolean>, patient: Patient) => {
          acc[patient.patientId] = false;
          return acc;
        }, {});
        setSelectedPatients(initialSelectedPatients);

        setLoading(false);
      } catch (error) {
        console.error("환자 데이터를 가져오는 중 오류 발생:", error);
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);
  
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedPatients(
      patients.reduce((acc, patient) => {
        acc[patient.patientId] = newSelectAll;
        return acc;
      }, {} as Record<number, boolean>)
    );
  };
  
  const handleIndividualSelect = (id: number) => {
    setSelectedPatients((prevState) => {
      const newState = { ...prevState, [id]: !prevState[id] };
      const allSelected = patients.every((patient) => newState[patient.patientId]);
      setSelectAll(allSelected);
      return newState;
    });
  };

  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/nurse-main');
  };

  const handleHamburgerClick = (event: React.MouseEvent<HTMLImageElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left });
      setIsDropdownVisible((prev) => !prev); 
    };

   // 스케줄 수정 시 호출
  const handleEditSchedule = (scheduleId: string) => {
    setEditingScheduleId(scheduleId); // 수정할 스케줄 ID 저장
    setCurrentView("edit"); // 화면을 수정 모드로 전환
  };

  // 스케줄 추가 버튼 클릭 시 호출
  const handleAddSchedule = () => {
    setCurrentView("add"); // 화면을 추가 모드로 전환
  };

  // 캔슬 버튼 클릭 시 호출
  const handleCancel = () => {
    setCurrentView("calendar"); // 캘린더 화면으로 전환
    setEditingScheduleId(null); // 수정 상태 초기화
  };
  
  const handleMenuClick = (path: string) => {
    if (path === "/nurse-schedule") {
      setCurrentView("calendar"); // 상태 초기화
    }
    navigate(path);
  };

  const handleViewChange = (view: "calendar" | "edit" | "add") => {
    setCurrentView(view);
  };

  useEffect(() => {
    if (location.pathname === "/nurse-schedule") {
    setCurrentView("calendar");
  }
}, [location]);
  

  return (
    /*전체 페이지 창*/
    <div className="flex flex-col h-screen bg-[#DFE6EC] overflow-hidden">
      
      {/*햄버거바 + 로고 영역*/}
      <div className="flex items-center pl-7">
        <img src={isDropdownVisible ? dwarrows : bar} alt="hamburger bar"
            className="relative w-[1.7em] h-[1.7em] mr-2 cursor-pointer"
            onClick={handleHamburgerClick}/>
          {isDropdownVisible && (
          <div className="absolute top-[2.5em] left-[0px] mt-2 w-[200px] bg-white shadow-lg rounded-md border"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>            
          <p className="text-black text-[15px] font-semibold pt-2 px-2">서울아산병원</p>
          <p className="text-gray-500 text-[13px] pt-1 pb-2 px-2">일반외과 병동</p>
          <hr className="bg-gray-600"></hr>

            <ul className="py-2">
              <li className="px-2 pt-2 pb-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-main")}>
                <img src={home} alt="home" className="w-4 h-4 mr-2" />메인 화면</li>

              <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-schedule")}>
                <img src={schedular} alt="schedular" className="w-4 h-4 mr-2" />스케줄러</li>

              <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-schedule")}>
                <img src={macro} alt="macro" className="w-4 h-4 mr-2" />매크로 설정</li>
                
              <li className="px-2 pt-1 pb-2 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center">
                  <img src={qresponse} alt="qresponse" className="w-4 h-4 mr-2" />빠른 답변 설정</li>

                <hr className="bg-gray-600"></hr>
                
              <li className="px-2 pt-2 pb-1 text-[13px] text-gray-500 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuClick("/change-ward")}>병동 변경</li>
              <li className="px-2 py-1 text-[13px] text-gray-500 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuClick("/reset-password")}>비밀번호 재설정</li>
              <li className="px-2 py-1 text-[13px] text-gray-500 hover:bg-gray-100 cursor-pointer" onClick={() => handleMenuClick("/nurse-login")}>로그아웃</li>
            </ul>
            </div>
          )}
          <img src={logo} alt="CareBridge 로고" className="w-[7.5em] h-[7.5em] cursor-pointer" onClick={handleLogoClick} />  
          </div>

      {/*스케줄 메인 페이지 영역*/}
      <div className="flex flex-1 overflow-hidden">

        {/*환자 목록 영역*/}
        <div className="flex flex-col bg-[#96B2C7] w-1/6 rounded-lg px-2 mb-4 ml-4 mr-2 shadow-md overflow-hidden">
          <h2 className="text-black font-semibold text-lg my-2 pl-2">환자 목록</h2>

          {/*전체선택, 추가 버튼 영역*/}
          <div className="flex justify-between items-center pl-2 mb-1">
            
            {/*전체선택, 추가 버튼 정렬*/}
            <div className="flex items-center">
              <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="mr-2"/>
              <label className="text-gray-600 text-sm">전체 선택</label>
            </div>
            <button className="text-sm text-gray-600 bg-transparent hover:text-gray-400 focus:outline-none" onClick={() => handleViewChange("add")}>추가</button>
          </div>

          {/*환자 목록 영역*/}
          <div className="h-[calc(100vh-14rem)] bg-white rounded-lg p-2 shadow-md overflow-y-auto">
          <ul>
                {patients.map((patient) => (
                  <li key={patient.patientId} className="flex items-center border-b border-gray-200 py-2">
                    <input
                      type="checkbox"
                      checked={selectedPatients[patient.patientId]}
                      id={`patient-${patient.patientId}`}
                      onChange={() => handleIndividualSelect(patient.patientId)}
                      className="mr-2 mb-5"
                    />
                    <label htmlFor={`patient-${patient.patientId}`} className="flex-1">
                      <span className="font-semibold">{patient.name}</span>
                      <p className="text-sm text-gray-500">{formatBirthdate(patient.birthDate)}</p>
                    </label>
                  </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col flex-1 bg-white rounded-lg shadow-md mb-4 ml-2 mr-4 px-4 overflow-y-auto">
          {currentView === "calendar" && <NurseCalendar onEdit={handleEditSchedule} />}
          {currentView === "edit" && editingScheduleId && (
            <ScheduleEditForm scheduleId={editingScheduleId} onCancel={handleCancel} />
          )}
          {currentView === "add" && <ScheduleAdd onCancel={handleCancel} />}
        </div>
      </div>
    </div>
  );
};

export default NurseSchedulePage;
