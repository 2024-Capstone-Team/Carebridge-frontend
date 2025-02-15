import React, {useEffect, useState} from 'react';
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
import useStompClient from "../../hooks/useStompClient";
import ChatMessages from "../../components/common/ChatMessages.tsx";
import { ChatMessage, RequestDto } from "../../types";


const NurseMainPage: React.FC = () => {

  const [requestPopup, setRequestPopup] = useState<RequestDto | null>(null);  // 요청사항 팝업 

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


  {/* 메시지 관련 코드 시작 */}

  // 테스트용 간호사 ID
  const nurseId = "1";
    
  // 웹소켓 연결 
  const { subscribeToRoom, sendMessage, isConnected } = useStompClient((message: any) => {
    // 들어오는 메시지 확인 
    if (message.type === "message") {
      const chatMessage: ChatMessage = message as ChatMessage;
      console.log("Received a chat message:", chatMessage);
      // 채팅 메시지 처리 (수정중)
    } else if (message.type === "request") {  // 메시지가 요청사항인지 확인 
      const request: RequestDto = message as RequestDto;
      console.log("Received a request message:", request);  
      // 요청 메시지 처리 (알림 띄우기)
      setRequestPopup(message as RequestDto); // 요청 메시지를 팝업에 저장
    } else {
      console.warn("Unknown message type:", message);
    }
  });

  // 테스트용 요청 메시지 보내기
  const handleTestRequest = () => {
    const testRequest: RequestDto = {
      requestId: 9999,
      patientId: 5,
      medicalStaffId: 1,
      requestContent: "테스트 요청: 환자가 도움이 필요합니다!",
      status: "pending",
      requestTime: new Date().toISOString(),
      acceptTime: null,
    };
    setRequestPopup(testRequest);
  };

  // 웹소켓 연결되면 간호사 채널에 구독
  useEffect(() => {
      if (!isConnected) return;
      subscribeToRoom(`/sub/user/chat/${nurseId}`); 
      return () => {
      };
    }, [isConnected]);

  {/* 메시지 관련 코드 끝 */}


  return (
    /*전체 창창*/
    <div className="flex h-screen bg-gray-100 p-6">

      {/* 요청 메시지 팝업 */} 
      {requestPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 relative">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setRequestPopup(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold text-center mb-4">🚨 요청 알림</h3>
            <p className="text-gray-800 text-center">{requestPopup.requestContent}</p>
            <p className="text-gray-500 text-sm text-center mt-2">
              요청 시간: {new Date(requestPopup.requestTime).toLocaleString()}
            </p>
          </div>
        </div>
      )}
      {/* 테스트 버튼 */}
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <button
          onClick={handleTestRequest}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md text-lg hover:bg-blue-700"
        >
          테스트 요청 보내기
        </button>
      </div>

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