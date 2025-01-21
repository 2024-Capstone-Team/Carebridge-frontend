import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import PreLoginPage from '../PreLoginPage';
import NurseSchedule from "../../components/nurse/NurseSchedule";
import NursePatientInfo from "../../components/nurse/Nurse_PatientInfo";
import Nurse_DetailedPatientInfo from '../../components/nurse/Nurse_DetailedPatientInfo';
import NurseService from '../../components/nurse/NurseService';
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";
import home from "../../assets/home.png";
import scheduler from "../../assets/scheduler.png";
import dbarrows from "../../assets/double arrows.png";
import NurseMessaging from '../../components/nurse/NurseMessaging'; 



const NurseMainPage: React.FC = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null); //환자 정보 선택 상태
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/nurse-main');
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleEditClick = (scheduleId: string) => {
    navigate(`/schedule/${scheduleId}`, { state: { editMode: true } }); // 수정 버튼 클릭 시 상태 전달
  };

  const handleMouseEnter = () => {
    setIsTooltipVisible(true); // 팝업 자세히 알림
  };

  const handleMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  const handlePatientClick = (patientName: string) => {
    setSelectedPatient(patientName); // 환자 상세 정보로 선택
  };

  const handleBackToList = () => {
    setSelectedPatient(null); // 목록으로 돌아가기
  };


  return (
    /*전체 창창*/
    <div className="flex h-screen bg-gray-100 p-6">
      <div className="h-full p-6 mr-4 border-r rounded-lg overflow-hidden bg-[#F0F4FA]">
        
        {/*로고 영역*/}
        <div className="flex items-center mb-4" style={{ marginTop: '-60px' }}>
          <img src={bar} alt="hamburger bar" className="w-[1.7em] h-[1.7em] mr-2" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
          <img src={logo} alt="CareBridge 로고" className="w-[7.5em] h-[7.5em] cursor-pointer" onClick={handleLogoClick} />
        </div>
        
        {/*현재 시간 영역*/}
        <div className="flex text-center text-gray-600 mb-4" style={{ marginTop: '-40px' }}>
          <p className='text-black font-semibold mr-2'>{formattedDate}</p>
          <p className='text-gray-600 font-[12px]'>{formattedTime}</p>
        </div>

        <p className='text-black font-semibold'>서울아산병원</p>
        <p className='text-gray-600 text-[12px]'>일반외과병동</p>
        <NurseService />

      </div>

      {/* Chat Application */}
      <NurseMessaging />

      {/*환자 정보 영역*/}
      <div className="patientinfo-content w-1/5 flex flex-col space-y-6">
        <div className="bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-1 mb-1">
          {selectedPatient ? (
            <Nurse_DetailedPatientInfo patientName={selectedPatient} onBack={handleBackToList} />
          ) : (
            <NursePatientInfo onPatientClick={handlePatientClick} />
          )}
        </div>

        {/*스케줄러 영역*/}
        <div className="schedule-content w-full h-full bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-1 overflow-hidden">
          <NurseSchedule />
        </div>

      </div>
    </div>
  );
};

export default NurseMainPage;