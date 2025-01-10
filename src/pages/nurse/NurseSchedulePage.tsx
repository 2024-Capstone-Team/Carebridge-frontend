import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import NurseCalendar from "../../components/nurse/Nurse_Calendar";
import ScheduleEditForm from "../../components/nurse/Nurse_ScheduleEdit";
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";

interface Patient {
  id: number;
  name: string;
  birthdate: string;
  condition: string;
}

const NurseSchedulePage: React.FC = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [patients] = useState<Patient[]>([
      { id: 1, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
      { id: 2, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
      { id: 3, name: "홍길동", birthdate: "1999.12.01", condition: "게실염" },
    ]);
    
    const [selectAll, setSelectAll] = useState(false);
    const handleSelectAll = () => {
      setSelectAll(!selectAll);
    };

    const navigate = useNavigate();
    const handleLogoClick = () => {
      navigate('/nurse-main');
    };

    const handleMouseEnter = () => {
      setIsTooltipVisible(true); // 팝업 자세히 알림
    };
  
    const handleMouseLeave = () => {
      setIsTooltipVisible(false);
    };

  return (
    /*전체 페이지 창*/
    <div className="flex h-screen bg-[#DFE6EC] flex-col">
      
      {/*햄버거바 + 로고 영역*/}
      <div className="flex items-center pl-7">
      <img src={bar} alt="hamburger bar" className="w-[1.7em] h-[1.7em] mr-2" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
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
            <button className="text-sm text-gray-600 bg-transparent hover:underline focus:outline-none">추가</button>
          </div>

          {/*환자 리스트 영역*/}
          <div className="h-[calc(100vh-16rem)] bg-white rounded-lg p-2 shadow-md overflow-y-auto">
            <ul>
            {patients.map((patient) => (
              <li key={patient.id} className="flex items-center border-b border-gray-200 py-2">
                  <input type="checkbox" checked={selectAll} id={`patient-${patient.id}`} className="mr-2"/>
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
          <ScheduleEditForm scheduleId={scheduleId} />
        </div>
        
      </div>
    </div>
  );
};

export default NurseSchedulePage;
