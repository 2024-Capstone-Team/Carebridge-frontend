import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import NurseCalendar from "../../components/nurse/Nurse_Calendar";
import ScheduleEditForm from "../../components/nurse/Nurse_ScheduleEdit";
import ScheduleAdd from "../../components/nurse/Nurse_ScheduleAdd";
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";
import home from "../../assets/home.png";
import scheduler from "../../assets/scheduler.png";
import macro from "../../assets/macro.png";


interface Patient {
  id: number;
  name: string;
  birthdate: string;
  condition: string;
}

const NurseSchedulePage: React.FC = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [currentView, setCurrentView] = useState<"calendar" | "edit" | "add">("calendar");
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [patients] = useState<Patient[]>([
      { id: 1, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
      { id: 2, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
      { id: 3, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
    ]);

    const [selectAll, setSelectAll] = useState(false);
    const [selectedPatients, setSelectedPatients] = useState<Record<number, boolean>>(
      patients.reduce((acc, patient) => {
        acc[patient.id] = false;
        return acc;
      }, {} as Record<number, boolean>)
    );

    const handleSelectAll = () => {
      const newSelectAll = !selectAll;
      setSelectAll(newSelectAll);
      setSelectedPatients(
        patients.reduce((acc, patient) => {
          acc[patient.id] = newSelectAll;
          return acc;
        }, {} as Record<number, boolean>)
      );
    };

    const handleIndividualSelect = (id: number) => {
      setSelectedPatients((prevState) => {
        const newState = { ...prevState, [id]: !prevState[id] };
        const allSelected = patients.every((patient) => newState[patient.id]);
        setSelectAll(allSelected);
        return newState;
      });
    };

    const navigate = useNavigate();

    const handleLogoClick = () => {
      navigate('/nurse-main');
    };

    const handleMouseEnter = () => {
      setIsDropdownVisible(true); // 팝업 자세히 알림
    };
  
    const handleMouseLeave = () => {
      setIsDropdownVisible(false);
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

     // URL 변경 감지 및 상태 초기화
    useEffect(() => {
      if (location.pathname === "/nurse-schedule") {
      setCurrentView("calendar");
    }
  }, [location]);

  return (
    /*전체 페이지 창*/
    <div className="flex h-screen bg-[#DFE6EC] flex-col">
      
      {/*햄버거바 + 로고 영역*/}
      <div className="flex items-center pl-7">
        <img src={bar} alt="hamburger bar" className="relative w-[1.7em] h-[1.7em] mr-2" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
          {isDropdownVisible && (
          <div className="absolute top-[2.5em] left-[0px] mt-2 w-[200px] bg-white shadow-lg rounded-md border" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <p className="text-black text-[15px] font-semibold pt-2 px-2">서울아산병원</p>
            <p className="text-gray-500 text-[13px] pt-1 pb-2 px-2">일반외과 병동</p>
            <hr className="bg-gray-600"></hr>

            <ul className="py-2">
              <li className="px-2 pt-2 pb-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-main")}>
                <img src={home} alt="home" className="w-4 h-4 mr-2" />메인 화면</li>

              <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-schedule")}>
                <img src={scheduler} alt="scheduler" className="w-4 h-4 mr-2" />스케줄러</li>

                <li className="px-2 pt-1 pb-2 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-schedule")}>
                <img src={macro} alt="macro" className="w-4 h-4 mr-2" />매크로 설정</li>
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
        <div className="bg-[#96B2C7] w-1/6 rounded-lg px-2 mb-4 ml-4 mr-2 shadow-md">
          <h2 className="text-black font-semibold text-lg my-2 pl-2">환자 목록</h2>

          {/*전체선택, 추가 버튼 영역*/}
          <div className="flex justify-between items-center pl-2 mb-1">
            
            {/*전체선택, 추가 버튼 정렬*/}
            <div className="flex items-center">
              <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="mr-2"/>
              <label className="text-gray-600 text-sm">전체 선택</label>
            </div>
            <button className="text-sm text-gray-600 bg-transparent hover:underline focus:outline-none" onClick={() => handleViewChange("add")}>추가</button>
          </div>

          {/*환자 리스트 영역*/}
          <div className="h-[calc(100vh-16rem)] bg-white rounded-lg p-2 shadow-md overflow-y-auto">
            <ul>
            {patients.map((patient) => (
              <li key={patient.id} className="flex items-center border-b border-gray-200 py-2">
                  <input type="checkbox" checked={selectedPatients[patient.id]} id={`patient-${patient.id}`}  
                  onChange={() => handleIndividualSelect(patient.id)} className="mr-2"/>
                  <label htmlFor={`patient-${patient.id}`} className="flex-1">
                  <span className="font-semibold">{patient.name}</span>
                  <p className="text-sm text-gray-500">{patient.birthdate}</p>
                  <p className="text-sm text-gray-500">{patient.condition}</p>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex-1 h-full bg-white rounded-lg shadow-md my-4 ml-2 mr-4 px-4">
          {currentView === "calendar" && <NurseCalendar />}
          {currentView === "edit" && (
            <ScheduleEditForm scheduleId="1" onCancel={() => handleViewChange("calendar")} />
          )}
          {currentView === "add" && <ScheduleAdd onCancel={() => handleViewChange("calendar")} />}
        </div>
        
      </div>
    </div>
  );
};

export default NurseSchedulePage;
