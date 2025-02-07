import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import PreLoginPage from '../PreLoginPage';
import NurseSchedule from "../../components/nurse/NurseSchedule";
import NursePatientInfo from "../../components/nurse/Nurse_PatientInfo";
import Nurse_DetailedPatientInfo from '../../components/nurse/Nurse_DetailedPatientInfo';
import NurseService from '../../components/nurse/NurseService';
import NurseMacro from '../../components/nurse/NurseMacro';
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";
import home from "../../assets/home.png";
import schedular from "../../assets/schedular.png";
import dbarrows from "../../assets/double arrows.png";
import dwarrows from "../../assets/down arrows.png";
import NurseMessaging from '../../components/nurse/NurseMessaging'; 
import macro from "../../assets/macro.png";
import axios from "axios";

const NurseMainPage: React.FC = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isMacroMode, setIsMacroMode] = useState(false); // 매크로 설정 화면 여부
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null); //환자 정보 선택 상태
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/nurse-main');
  };

  const handleHamburgerClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setIsDropdownVisible((prev) => !prev); 
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

  const handleMacroClick = () => {
    setIsMacroMode(true); // 매크로 설정 화면 활성화
  };

  const handleMainScreenClick = () => {
    setIsMacroMode(false); // 메인 화면으로 복귀
  };

  const handleEditClick = (scheduleId: string) => {
    navigate(`/schedule/${scheduleId}`, { state: { editMode: true } }); // 수정 버튼 클릭 시 상태 전달
  };

  const handleMenuClick = (path: string) => {
    setIsDropdownVisible(false); // 메뉴 클릭 시 드롭다운 닫기
    navigate(path);
  };

  const handlePatientClick = (patientId: number) => {
    console.log("선택된 환자 ID:", patientId);
    setSelectedPatient(patientId); // 환자 상세 정보로 선택
  };

  const handleBackToList = () => {
    console.log("목록으로 돌아가기");
    setSelectedPatient(null); // 목록으로 돌아가기
  };


  return (
    /*전체 창*/
    <div className="flex h-screen bg-gray-100 p-6">
      <div className="h-full w-1/5 p-6 mr-4 rounded-lg overflow-hidden bg-[#F0F4FA]">
        
        {/*로고 영역*/}
        <div className="flex items-center mb-4" style={{ marginTop: '-60px' }}>
        <img src={isDropdownVisible ? dwarrows : bar} alt="hamburger bar"
            className="relative w-[1.7em] h-[1.7em] mr-2 cursor-pointer"
            onClick={handleHamburgerClick}/>
          {isDropdownVisible && (
          <div className="absolute top-[2.5em] left-[0px] mt-2 w-[200px] bg-white shadow-lg rounded-md border"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>            <p className="text-black text-[15px] font-semibold pt-2 px-2">서울아산병원</p>
            <p className="text-gray-500 text-[13px] pt-1 pb-2 px-2">일반외과 병동</p>
            <hr className="bg-gray-600"></hr>

            <ul className="py-2">
              <li className="px-2 pt-2 pb-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-main")}>
                <img src={home} alt="home" className="w-4 h-4 mr-2" />메인 화면</li>

              <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-schedule")}>
                <img src={schedular} alt="schedular" className="w-4 h-4 mr-2" />스케줄러</li>

                <li className="px-2 pt-1 pb-2 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={handleMacroClick}>
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
        
        {/*현재 시간 영역*/}
        <div className="flex text-center text-gray-600 mb-4" style={{ marginTop: '-40px' }}>
          <p className='text-black font-semibold mr-2'>{formattedDate}</p>
          <p className='text-gray-600 font-[12px]'>{formattedTime}</p>
        </div>

        <p className='text-black font-semibold'>서울아산병원</p>
        <p className='text-gray-600 text-[12px]'>일반외과병동</p>
        <NurseService />

      </div>

      {/*채팅 목록*/}
      <div className="flex-1 bg-white rounded-tl-lg rounded-bl-lg shadow-lg p-6">
      </div>

      {/*채팅*/}
      <div className="flex-1 bg-white rounded-tr-lg rounded-br-lg shadow-lg p-6 mr-3">
      </div>

      {/*환자 정보 영역*/}
      <div className="w-1/5 flex flex-col space-y-6">
        <div className="bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-1 mb-1">
          {selectedPatient !== null ? (
            <Nurse_DetailedPatientInfo patientId={selectedPatient} onBack={handleBackToList} />
          ) : (
            <NursePatientInfo onPatientClick={handlePatientClick} />
          )}
        </div>

        {/*스케줄러 영역*/}
        <div className="w-full h-full bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-grow overflow-hidden">
          <NurseSchedule />
        </div>

        {isMacroMode && (
          <div className="absolute inset-0 flex justify-center ml-9 mr-6 items-center z-50">
            <NurseMacro onClose={handleMainScreenClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseMainPage;