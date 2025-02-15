import React, {useState, useEffect} from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import PreLoginPage from '../PreLoginPage';
import NurseSchedule from "../../components/nurse/NurseSchedule";
import NursePatientInfo from "../../components/nurse/Nurse_PatientInfo";
import Nurse_DetailedPatientInfo from '../../components/nurse/Nurse_DetailedPatientInfo';
import NurseMacro from '../../components/nurse/NurseMacro';
import NurseMacroList from '../../components/nurse/NurseMacroList';
import NurseMacroEdit from '../../components/nurse/NurseMacroEdit';
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";
import home from "../../assets/home.png";
import schedular from "../../assets/schedular.png";
import dbarrows from "../../assets/double arrows.png";
import dwarrows from "../../assets/down arrows.png";
import qresponse from "../../assets/quick response.png";
import NurseMessaging from '../../components/nurse/NurseMessaging'; 
import useStompClient from "../../hooks/useStompClient";
import ChatMessages from "../../components/common/ChatMessages.tsx";
import { ChatMessage, RequestDto } from "../../types";import macro from "../../assets/macro.png";
import axios from "axios";

interface CallBellRequest {
  requestId: number;
  patientId: number;
  medicalStaffId: number;
  requestContent: string;
  status: string;
  requestTime: string;
  acceptTime: string;
}

interface PatientDetail {
  patientId: number;
  phoneNumber: string;
  name: string;
  birthDate: string; 
  gender: string;
  guardianContact: string;
  hospitalId: number;
  hospitalLocation: string;
  chatRoomId: string;
  department: string;
  email: string;
  hospitalizationDate: string;
  userId: number;
}

const NurseMainPage: React.FC = () => {

  const [requestPopup, setRequestPopup] = useState<RequestDto | null>(null);  // 요청사항 팝업 

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isMacroMode, setIsMacroMode] = useState(false); // 매크로 설정 화면 여부
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null); //환자 정보 선택 상태
  const [hospitalName, setHospitalName] = useState(""); // 불러올 병원 이름
  const [requests, setRequests] = useState<CallBellRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [patientDetails, setPatientDetails] = useState<{ [key: number]: PatientDetail }>({});
  const [currentTime, setCurrentTime] = useState(new Date()); // 시간 업데이트 state
  const navigate = useNavigate();
  const location = useLocation();

  const medicalStaffId = 1; // 임시 staffId
  const hospitalId = 1; // 임시 병원 Id

  // 병원 이름을 API로부터 불러오기
  useEffect(() => {
    axios.get(`http://localhost:8080/api/hospital/name/${hospitalId}`)
      .then(response => {
        setHospitalName(response.data);
      })
      .catch(error => {
        console.error("Error fetching hospital name:", error);
        setHospitalName("병원 정보를 불러오지 못했습니다.");
      });
  }, [hospitalId]);

  const handleLogoClick = () => {
    setIsMacroMode(false); // 매크로 모드 해제
    navigate('/nurse-main');
  };

  const handleHamburgerClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setIsDropdownVisible((prev) => !prev); 
  };

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1초마다 업데이트
    return () => clearInterval(timerId); 
  }, []);

  // 날짜와 시간 포맷팅
  const formattedDate = currentTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    if (location.state && location.state.macroMode) {
      setIsMacroMode(true);
    }
  }, [location]);

  const handleMacroClick = () => {
    setIsMacroMode(true); // 매크로 설정 화면 활성화
    setIsDropdownVisible(false);
  };

  const handleMainScreenClick = () => {
    setIsMacroMode(false); // 메인 화면으로 복귀
  };

  const handleEditClick = (scheduleId: string) => {
    navigate(`/schedule/${scheduleId}`, { state: { editMode: true } }); // 수정 버튼 클릭 시 상태 전달
  };

  const handleMenuClick = (path: string) => {
    setIsDropdownVisible(false); // 메뉴 클릭 시 드롭다운 닫기
    setIsMacroMode(false); // 매크로 모드 해제
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

  // status 변환
  const convertStatus = (status: string): string => {
    if (status === "PENDING") return "대기";
    return status;
  };

  // 만 나이 계산
  const calculateAge = (birthDateString: string): number | string => {
    if (!birthDateString) return "정보 없음";

    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) {
      return "정보 없음";
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const isBeforeBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

    if (isBeforeBirthday) {
      age--;
    }
    return age;
  };

  // 생년월일 포맷 변환
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

  // 성별 포맷 변환
  const formatGender = (gender: string): string => {
    return gender === "Male" ? "남" : gender === "Female" ? "여" : "정보 없음";
  };

  // 시간만 추출
  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "정보 없음";
    try {
      const dateObj = new Date(timeString);
      if (isNaN(dateObj.getTime())) return "정보 없음";
      return dateObj.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("formatTime 처리 중 에러:", error);
      return "정보 없음";
    }
  };

  useEffect(() => {
      const fetchRequests = async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/call-bell/request/staff/${medicalStaffId}`);
          if (!response.ok) {
            console.error("호출 요청 API 에러", response.status);
            return;
          }
          const data: CallBellRequest[] = await response.json();
          setRequests(data);
        } catch (error) {
          console.error("호출 요청 데이터 가져오기 실패", error);
        }
      };
  
      fetchRequests();
    }, [medicalStaffId]);
  
    useEffect(() => {
      const uniquePatientIds = Array.from(new Set(requests.map((req) => req.patientId)));
  
      uniquePatientIds.forEach((patientId) => {
        // 아직 환자의 상세 정보를 가져오지 않은 경우만 API 호출
        if (!patientDetails[patientId]) {
          fetchPatientDetail(patientId);
        }
      });
    }, [requests]);
  
    const fetchPatientDetail = async (patientId: number) => {
      try {
        const response = await fetch(`http://localhost:8080/api/patient/user/${patientId}`);
        if (!response.ok) {
          console.error(`환자 상세 정보 API 에러 (ID: ${patientId})`, response.status);
          return;
        }
        const data: PatientDetail = await response.json();
        setPatientDetails((prevDetails) => ({ ...prevDetails, [patientId]: data }));
      } catch (error) {
        console.error(`환자 상세 정보 가져오기 실패 (ID: ${patientId})`, error);
      }
    };
  
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedStatus(e.target.value);
    };
  
    // 상태 우선순위
    const statusPriority = ['대기', '진행 중', '예약', '완료'];
  
    const filteredRequests =
      selectedStatus === "전체"
        ? [...requests].sort(
            (a, b) =>
              statusPriority.indexOf(convertStatus(a.status)) - statusPriority.indexOf(convertStatus(b.status))
          )
        : requests.filter((req) => convertStatus(req.status) === selectedStatus);
  

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
    /*전체 창*/
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

      <div className="h-full w-1/5 p-6 mr-4 rounded-lg overflow-hidden bg-[#F0F4FA]">
        
        {/*로고 영역*/}
        <div className="flex items-center mb-4" style={{ marginTop: '-60px' }}>
        <img src={isDropdownVisible ? dwarrows : bar} alt="hamburger bar"
            className="relative w-[1.7em] h-[1.7em] mr-2 cursor-pointer"
            onClick={handleHamburgerClick}/>
          {isDropdownVisible && (
            <div className="absolute top-[2.5em] left-[0px] mt-2 w-[200px] bg-white shadow-lg rounded-md border"
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>           
              <p className="text-black text-[15px] font-semibold pt-2 px-2">{hospitalName ? hospitalName : "Loading..."}</p> 
              <p className="text-gray-500 text-[13px] pt-1 pb-2 px-2">일반외과 병동</p>
              <hr className="bg-gray-600"></hr>
              
              <ul className="py-2">
                <li className="px-2 pt-2 pb-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-main")}>
                  <img src={home} alt="home" className="w-4 h-4 mr-2" />메인 화면</li>

                <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={() => handleMenuClick("/nurse-schedule")}>
                  <img src={schedular} alt="schedular" className="w-4 h-4 mr-2" />스케줄러</li>

                <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={handleMacroClick}>
                  <img src={macro} alt="macro" className="w-4 h-4 mr-2" />매크로 설정</li>
                  
                <li className="px-2 pt-1 pb-2 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center" onClick={handleMacroClick}>
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
      
      {/*현재 시간 영역*/}
      <div className="flex text-center text-gray-600 mb-4" style={{ marginTop: '-40px' }}>
        <p className='text-black font-semibold mr-2'>{formattedDate}</p>
        <p className='text-gray-600 font-[12px]'>{formattedTime}</p>
      </div>

      <p className='text-black font-semibold'>{hospitalName ? hospitalName : "Loading..."}</p>
      <p className='text-gray-600 text-[12px]'>일반외과병동</p>

      {/* 콜벨서비스 영역 */}
      <div className="flex justify-end bg-[#98B3C8] w-full h-[40px] mt-4 pl-20 pr-3 rounded-tl-md rounded-tr-md">
        <select value={selectedStatus} onChange={handleStatusChange} className="items-center w-[120px] border border-gray-400 m-1.5 rounded">
          <option value="전체">전체</option>
          <option value="대기">대기</option>
          <option value="진행 중">진행 중</option>
          <option value="예약">예약</option>
          <option value="완료">완료</option>
        </select>
      </div>

      <div className="flex-grow h-[670px] overflow-y-auto">
        {filteredRequests.map((request) => {
          const displayStatus = convertStatus(request.status);
          return (
            <div key={request.requestId} className="p-3 border border-gray-300">
              <div className="flex justify-between">
                <div>
                  {patientDetails[request.patientId] && (
                    <>
                      <div className="flex justify-between">
                        <p className="font-bold text-[17px]">{patientDetails[request.patientId].name}</p>
                        <div className="flex flex-col items-end text-[11px] text-gray-500 pl-20 ml-7 pb-1">
                          <p>요청: {formatTime(request.requestTime)}</p>
                          <p>예약: {request.acceptTime ? formatTime(request.acceptTime) : "대기 중"}</p>
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500">
                        {formatBirthdate(patientDetails[request.patientId].birthDate)}{"  "}
                        {typeof calculateAge(patientDetails[request.patientId].birthDate) === "number"
                          ? `${calculateAge(patientDetails[request.patientId].birthDate)}세`
                          : calculateAge(patientDetails[request.patientId].birthDate)
                        }{"  "}
                        {formatGender(patientDetails[request.patientId].gender)}
                      </p>
                    </>
                  )}
                  <p className="text-[11px] text-gray-500">{request.requestContent}</p>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <h2
                  className={`px-3 py-1 text-sm font-semibold rounded mr-2 ${
                    displayStatus === "대기"
                      ? "bg-[#F8F8F8] border border-[#E3E3E3]"
                      : displayStatus === "진행 중"
                      ? "bg-[#417BB4] border border-[#306292] text-white"
                      : displayStatus === "예약"
                      ? "bg-[#C75151] border border-[#B14141] text-white"
                      : displayStatus === "완료"
                      ? "bg-[#E3E3E3] border border-[#CFC9C9]"
                      : "bg-gray-300"
                  }`}
                >
                  {displayStatus}
                </h2>
                <button className="px-4 py-1 bg-gray-400 text-sm font-semibold rounded">채팅</button>
              </div>
            </div>
          );
        })}
        </div>
        </div>
        
        {isMacroMode ? (
        // 매크로 모드일 때
          <div className="flex-1 relative w-full">
            <NurseMacroList medicalStaffId={medicalStaffId} />
          </div>
        ) : (
          // 매크로 모드가 아닐 때
          <>
          <NurseMessaging />

          {/* 환자 정보 */}
          <div className="w-1/5 flex flex-col space-y-6">
            <div className="bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-1 mb-1">
              {selectedPatient !== null ? (
                <Nurse_DetailedPatientInfo patientId={selectedPatient} onBack={handleBackToList} />
              ) : (
                <NursePatientInfo onPatientClick={handlePatientClick} />
              )}
            </div>

            {/* 스케줄러 */}
            <div className="w-full h-full bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-grow overflow-hidden">
              <NurseSchedule />
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default NurseMainPage;