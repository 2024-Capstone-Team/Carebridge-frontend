import React, {useState, useEffect, useMemo} from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { SnackbarProvider, useSnackbar } from 'notistack';
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
import { ChatMessage, CallBellRequest, PatientDetail } from "../../types";
import macro from "../../assets/macro.png";
import axios from "axios";

const NurseMainPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // =============== 상태 관리 ===============
  /**
   * @description 알림 시스템 관련 상태
   * @property notificationQueue - 대기 중인 알림 목록을 관리
   * @property currentNotification - 현재 표시 중인 알림 정보
   * @property unreadNotifications - 읽지 않은 알림을 저장하는 객체
   * @property isProcessingQueue - 알림 처리 진행 상태
   */
  const [notificationQueue, setNotificationQueue] = useState<CallBellRequest[]>([]);
  const [currentNotification, setCurrentNotification] = useState<CallBellRequest | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState<{[key: number]: Date}>({});
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const [requestPopup, setRequestPopup] = useState<CallBellRequest | null>(null);  // 요청사항 팝업 
  const [isTimeSelection, setIsTimeSelection] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

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
  
    // useMemo를 컴포넌트 최상위 레벨로 이동
    const uniquePatientIds = useMemo(() => 
        Array.from(new Set(requests.map((req) => req.patientId))),
        [requests]
    );
  
    // useEffect에서는 계산된 값을 사용
    useEffect(() => {
        uniquePatientIds.forEach((patientId) => {
            if (!patientDetails[patientId]) {
                fetchPatientDetail(patientId);
            }
        });
    }, [uniquePatientIds, patientDetails]); // 의존성 배열 수정
  
  /**
   * @description 데이터 가져오기 - 환자 상세 정보
   * 환자의 기본 정보와 질병명을 병렬로 조회합니다.
   */
  const fetchPatientDetail = async (patientId: number) => {
    try {
      // 환자 기본 정보와 질병명을 병렬로 가져오기
      const [patientResponse, diseaseResponse] = await Promise.all([
        fetch(`http://localhost:8080/api/patient/user/${patientId}`),
        fetch(`http://localhost:8080/api/medical-record/${patientId}`)
      ]);

      if (!patientResponse.ok) {
        console.error(`환자 상세 정보 API 에러 (ID: ${patientId})`, patientResponse.status);
        return;
      }
      if (!diseaseResponse.ok) {
        console.error(`질병명 조회 API 에러 (ID: ${patientId})`, diseaseResponse.status);
        return;
      }

      const patientData: PatientDetail = await patientResponse.json();
      const disease = await diseaseResponse.text();

      // 환자 정보와 질병명을 한 번에 업데이트
      setPatientDetails(prevDetails => ({
        ...prevDetails,
        [patientId]: {
          ...patientData,
          disease: disease
        }
      }));
    } catch (error) {
      console.error(`환자 정보 가져오기 실패 (ID: ${patientId})`, error);
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
      const request: CallBellRequest = message as CallBellRequest;
      console.log("요청 메시지 수신:", request);
      
      // 환자 정보가 없는 경우에만 fetch (질병명도 함께 가져옴)
      if (!patientDetails[request.patientId]) {
        fetchPatientDetail(request.patientId);
      }
      
      // 현재 표시 중인 알림이 없을 때만 바로 표시
      if (!currentNotification && !requestPopup) {
        setRequestPopup(request);
        setCurrentNotification(request);
      } else {
        // 이미 다른 알림이 표시 중이면 큐에 추가
        addToQueue(request);
      }
    } else {
      console.warn("알 수 없는 메시지 타입:", message);
    }
  });

  // 테스트용 요청 메시지 보내기
  const handleTestRequest = async () => {
    const testRequest: CallBellRequest = {
      requestId: 9999,
      patientId: 5,
      medicalStaffId: 1,
      requestContent: "진통제 투약 요청",
      status: "pending",
      requestTime: new Date().toISOString(),
      acceptTime: null,
    };
    
    // 환자 정보와 질병명을 한 번에 가져오기
    await fetchPatientDetail(testRequest.patientId);
    
    // 데이터가 준비된 후에 팝업 표시
    setRequestPopup(testRequest);
  };

  // 웹소켓 연결되면 간호사 채널에 구독
  useEffect(() => {
      if (!isConnected) return;
      subscribeToRoom(`/sub/user/chat/${nurseId}`); 
      return () => {
      };
    }, [isConnected]);

  // ===== 알림 큐 관련 함수들 =====
  
  /**
   * 알림을 큐에 추가하는 함수
   * @param notification 추가할 알림
   */
  const addToQueue = (notification: CallBellRequest) => {
    setNotificationQueue(prev => [...prev, notification]);
    // 미확인 알림에 추가
    setUnreadNotifications(prev => ({
      ...prev,
      [notification.requestId]: new Date()
    }));
  };

  /**
   * 큐에서 다음 알림을 처리하는 함수
   */
  const processNextNotification = () => {
    if (notificationQueue.length > 0 && !currentNotification && !requestPopup) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);
      setRequestPopup(nextNotification);
      setNotificationQueue(prev => prev.slice(1));
    }
  };

  /**
   * 알림 팝업을 닫을 때 호출되는 함수
   */
  const handleCloseNotification = () => {
    setRequestPopup(null);
    setCurrentNotification(null);
    setIsTimeSelection(false);
    setSelectedTime(null);
  };

  // 큐 처리를 위한 useEffect
  useEffect(() => {
    if (!isProcessingQueue && notificationQueue.length > 0 && !currentNotification) {
      setIsProcessingQueue(true);
      processNextNotification();
      setIsProcessingQueue(false);
    }
  }, [notificationQueue, currentNotification, isProcessingQueue]);

  // 미확인 알림 재알림을 위한 useEffect
  useEffect(() => {
    const checkUnreadNotifications = () => {
      const now = new Date();
      Object.entries(unreadNotifications).forEach(([requestId, timestamp]) => {
        const timeDiff = now.getTime() - timestamp.getTime();
        const minutesPassed = Math.floor(timeDiff / (1000 * 60));
        
        // 5분이 지난 미확인 알림 재표시
        if (minutesPassed >= 5) {
          const notification = requests.find(req => req.requestId === Number(requestId));
          if (notification) {
            // 현재 표시 중인 알림이 없을 때만 재알림
            if (!currentNotification && !requestPopup) {
              setRequestPopup(notification);
              setCurrentNotification(notification);
            } else {
              // 이미 다른 알림이 표시 중이면 큐에 추가
              addToQueue(notification);
            }
            // 타임스탬프 갱신
            setUnreadNotifications(prev => ({
              ...prev,
              [requestId]: new Date()
            }));
          }
        }
      });
    };

    // 1분마다 미확인 알림 체크
    const intervalId = setInterval(checkUnreadNotifications, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [unreadNotifications, requests, currentNotification, requestPopup]);

  // 알림 처리 완료 시 호출되는 함수들 수정
  const handlePending = async (requestId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/call-bell/request/status/${requestId}?status=PENDING`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        console.error('보류 상태 변경 실패:', response.status);
        enqueueSnackbar('요청 처리에 실패했습니다.', { 
          variant: 'error',
          autoHideDuration: 2000,
        });
        return;
      }
      
      const responseData = await response.text();
      console.log('요청 처리 완료:', responseData);
      
      // 알림 큐에서 다음 알림 처리
      handleCloseNotification();
      
      // 미확인 알림 목록에서 제거
      const { [requestId]: removed, ...remainingNotifications } = unreadNotifications;
      setUnreadNotifications(remainingNotifications);
      
      enqueueSnackbar('요청이 성공적으로 보류 처리되었습니다.', { 
        variant: 'success',
        autoHideDuration: 2000,
      });
      
    } catch (error) {
      console.error('보류 상태 변경 중 에러 발생:', error);
      enqueueSnackbar('요청 처리 중 오류가 발생했습니다.', { 
        variant: 'error',
        autoHideDuration: 2000,
      });
    }
  };

  const handleConfirmTime = async () => {
    if (!selectedTime || !requestPopup) return;

    try {
      const now = new Date();
      
      const timeResponse = await fetch(`http://localhost:8080/api/call-bell/request/${requestPopup.requestId}?acceptTime=${now.toISOString()}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!timeResponse.ok) {
        throw new Error('시간 설정에 실패했습니다.');
      }

      const statusResponse = await fetch(`http://localhost:8080/api/call-bell/request/status/${requestPopup.requestId}?status=SCHEDULED`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!statusResponse.ok) {
        throw new Error('상태 변경에 실패했습니다.');
      }

      const chatRoomId = `${medicalStaffId}_${requestPopup.patientId}`;
      const timeDiff = Math.round((selectedTime.getTime() - now.getTime()) / (1000 * 60));
      const message = `${timeDiff}분 후 도착합니다.`;

      const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      const formattedTime = koreanTime.toISOString().replace('Z', '');
      
      const messageToSend = {
        patientId: requestPopup.patientId,
        medicalStaffId: medicalStaffId,
        messageContent: message,
        timestamp: formattedTime,
        readStatus: false,
        chatRoomId: chatRoomId,
        senderId: medicalStaffId,
        isPatient: false,
        type: "TEXT",
        hospitalId: hospitalId,
        category: "CALLBELL_RESPONSE"
      };

      sendMessage("/pub/chat/message", messageToSend);
      
      // 알림 큐에서 다음 알림 처리
      handleCloseNotification();
      
      // 미확인 알림 목록에서 제거
      const { [requestPopup.requestId]: removed, ...remainingNotifications } = unreadNotifications;
      setUnreadNotifications(remainingNotifications);
      
      enqueueSnackbar('요청이 성공적으로 예약되었습니다.', { 
        variant: 'success',
        autoHideDuration: 2000,
      });
      
    } catch (error: any) {
      console.error('요청 처리 중 에러 발생:', error);
      enqueueSnackbar(`요청 처리 중 오류가 발생했습니다: ${error.message}`, { 
        variant: 'error',
        autoHideDuration: 2000,
      });
    }
  };

  {/* 메시지 관련 코드 끝 */}

  // 날짜 포맷팅 함수 추가
  const formatRequestTime = (timeString: string): string => {
    const date = new Date(timeString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12;

    return `${year}-${month}-${day} ${ampm} ${formattedHours}:${minutes}`;
  };

  // ===== 시간 선택 관련 함수들 =====
  
  // 시간 선택 화면으로 전환
  const handleAcceptClick = () => {
    setIsTimeSelection(true);
    setSelectedTime(new Date());
  };

  // 시간 버튼 클릭 핸들러
  const handleTimeButtonClick = (minutes: number) => {
    const newTime = new Date();
    newTime.setMinutes(newTime.getMinutes() + minutes);
    setSelectedTime(newTime);
  };

  // 시간 포맷팅 함수
  const formatSelectedTime = (date: Date | null) => {
    if (!date) return "00:00";
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 p-6">

      {/* ===== 요청 메시지 팝업 컨테이너 ===== */}
      {requestPopup && patientDetails[requestPopup.patientId] && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* ----- 팝업 메인 박스 ----- */}
          <div className="bg-white p-6 rounded-none shadow-[0_15px_50px_rgba(0,0,0,0.4)] w-[60vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw] min-h-[334px] relative border-[1.8px] border-gray-300 flex flex-col items-center">
            
            {/* ----- 닫기 버튼 ----- */}
            {/* 우측 상단에 위치한 X 버튼. 클릭 시 팝업을 닫고 시간 선택 상태를 초기화 */}
            <button
              onClick={() => {
                setRequestPopup(null);
                setIsTimeSelection(false);
                setSelectedTime(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              ✖
            </button>

            {/* ----- 요청 시간 표시 ----- */}
            {/* 요청이 들어온 시간을 년-월-일 오전/오후 시:분 형식으로 표시 */}
            <p className="text-center text-[18px] text-gray-600 mb-2">
              {formatRequestTime(requestPopup.requestTime)}
            </p>

            {/* ----- 환자 기본 정보 ----- */}
            {/* 환자의 나이, 성별, 질병명을 한 줄로 표시 */}
            <p className="text-center text-[18px] text-gray-700 mb-1">
              만 {calculateAge(patientDetails[requestPopup.patientId].birthDate)}세 
              {"  "}
              {formatGender(patientDetails[requestPopup.patientId].gender)}
              {"  "}
              {patientDetails[requestPopup.patientId].disease || "질병명 로딩중..."}
            </p>

            {/* ----- 환자 이름 ----- */}
            {/* 환자 이름을 크게 표시하고 '환자' 텍스트 추가 */}
            <p className="text-center text-xl lg:text-2xl xl:text-3xl mb-2 font-bold text-black">
              {patientDetails[requestPopup.patientId].name} 환자
            </p>

            {/* ----- 요청 내용 ----- */}
            {/* 환자가 요청한 구체적인 내용을 크게 표시 */}
            <p className="text-center text-xl lg:text-2xl xl:text-3xl mb-5 font-bold text-black">
              {requestPopup.requestContent}
            </p>

            {/* ----- 안내 문구 ----- */}
            {/* 시간 선택 모드에 따라 다른 안내 문구 표시 */}
            <p className="text-center text-[18px] text-gray-700 mb-8">
              {isTimeSelection ? "제공 가능한 시간을 입력해주세요." : "수락하시겠습니까?"}
            </p>

            {/* ===== 버튼 그룹 영역 ===== */}
            <div className="flex flex-col items-center w-full">
              {isTimeSelection ? (
                // 시간 선택 모드 UI
                <>
                  {/* 빠른 시간 선택 버튼들 */}
                  <div className="flex justify-between w-[60%] mb-6">
                    <button 
                      onClick={() => handleTimeButtonClick(5)}
                      className="px-4 py-2 bg-[#E3E3E3] text-black rounded-lg border-[1.5px] border-[#CFC9C9] hover:bg-[#8B8787] transition-all duration-200">
                      5분 후
                    </button>
                    <button 
                      onClick={() => handleTimeButtonClick(10)}
                      className="px-4 py-2 bg-[#E3E3E3] text-black rounded-lg border-[1.5px] border-[#CFC9C9] hover:bg-[#8B8787] transition-all duration-200">
                      10분 후
                    </button>
                    <button 
                      onClick={() => handleTimeButtonClick(30)}
                      className="px-4 py-2 bg-[#E3E3E3] text-black rounded-lg border-[1.5px] border-[#CFC9C9] hover:bg-[#8B8787] transition-all duration-200">
                      30분 후
                    </button>
                  </div>

                  {/* 선택된 시간 표시 영역 */}
                  <div className="w-[60%] bg-white border-[1.5px] border-[#A9A9A9] rounded-lg px-4 py-1 mb-6 text-center text-black font-bold text-[70px] leading-none">
                    {formatSelectedTime(selectedTime)}
                  </div>

                  {/* 취소/확인 버튼 */}
                  <div className="flex justify-end space-x-3 w-full">
                    <button 
                      onClick={() => {
                        setIsTimeSelection(false);
                        setSelectedTime(null);
                      }}
                      className="px-3 py-2 bg-[#E3E3E3] text-black rounded-lg border-[1.3px] border-[#A5A1A1] shadow-[0_3px_10px_rgba(0,0,0,0.25)] hover:bg-[#8B8787] hover:shadow-[0_5px_15px_rgba(0,0,0,0.35)] transition-all duration-200">
                      취소
                    </button>
                    <button 
                      onClick={handleConfirmTime}
                      className="px-3 py-2 bg-white text-black border-[1.3px] border-[#A5A1A1] rounded-lg shadow-[0_3px_10px_rgba(0,0,0,0.25)] hover:bg-gray-50 hover:shadow-[0_5px_15px_rgba(0,0,0,0.35)] transition-all duration-200">
                      확인
                    </button>
                  </div>
                </>
              ) : (
                // 기본 모드 UI
                <div className="flex justify-end space-x-3 w-full">
                  <button 
                    onClick={() => handlePending(requestPopup.requestId)}
                    className="px-3 py-2 bg-[#E3E3E3] text-black rounded-lg border-[1.3px] border-[#A5A1A1] shadow-[0_3px_10px_rgba(0,0,0,0.25)] hover:bg-[#8B8787] hover:shadow-[0_5px_15px_rgba(0,0,0,0.35)] transition-all duration-200">
                    보류
                  </button>
                  <button className="px-3 py-2 bg-white text-black border-[1.3px] border-[#A5A1A1] rounded-lg shadow-[0_3px_10px_rgba(0,0,0,0.25)] hover:bg-gray-50 hover:shadow-[0_5px_15px_rgba(0,0,0,0.35)] transition-all duration-200">
                    채팅
                  </button>
                  <button 
                    onClick={handleAcceptClick}
                    className="px-3 py-2 bg-white text-black border-[1.3px] border-[#A5A1A1] rounded-lg shadow-[0_3px_10px_rgba(0,0,0,0.25)] hover:bg-gray-50 hover:shadow-[0_5px_15px_rgba(0,0,0,0.35)] transition-all duration-200">
                    수락
                  </button>
                </div>
              )}
            </div>
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