import React, {useState, useEffect, useRef, createContext, useCallback} from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import NurseSchedule from "../../components/nurse/NurseSchedule";
import NursePatientInfo from "../../components/nurse/NursePatientInfo";
import Nurse_DetailedPatientInfo from '../../components/nurse/NurseDetailedPatientInfo';
import NurseMacroList from '../../components/nurse/NurseMacroList';
import NurseQuickAnswerList from '../../components/nurse/NurseQuickAnswerList';
import NurseMessaging from '../../components/nurse/NurseMessaging';
import logo from "../../assets/carebridge_logo.png";
import { FiMenu, FiChevronsDown, FiHome, FiCalendar, FiCpu } from "react-icons/fi";
import { BsStopwatch } from "react-icons/bs";
import useStompClient from "../../hooks/useStompClient";
import ChatMessages from "../../components/common/ChatMessages.tsx";
import { ChatMessage, CallBellRequest, PatientDetail, ChatRoom, ChatConversation, MedicalStaff } from "../../types";
import axios from "axios";
import { useUserContext } from "../../context/UserContext";
import { calculateAge, formatBirthdate, formatGender, formatTime } from '../../utils/commonUtils.ts';

const WebSocketContext = createContext(null);

// conversationId에서 patientId 추출
function parsePatientId(conversationId: string) {
  const parts = conversationId.split("_");
  if (parts.length < 2) return 0;
  return parseInt(parts[1], 10);
}

const NurseMainPage: React.FC = () => {  
  const [requestPopup, setRequestPopup] = useState<CallBellRequest | null>(null);  // 요청사항 팝업 
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // 메뉴 팝업 표시
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 }); // 메뉴바 위치 설정
  const [isMacroMode, setIsMacroMode] = useState(false); // 매크로 설정 화면 여부
  const [isQAMode, setIsQAMode] = useState(false); // 빠른 답변 모드 설정 화면 여부
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null); // 환자 정보 선택 상태
  const [hospitalName, setHospitalName] = useState(""); // 불러올 병원 이름
  const [medicalStaffList, setMedicalStaffList] = useState<MedicalStaff[]>([]); // 분과 이름
  const [requests, setRequests] = useState<CallBellRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [patientDetails, setPatientDetails] = useState<{ [key: number]: PatientDetail }>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();
  const location = useLocation();

  const { hospitalId } = useUserContext();
  const medicalStaffId = 1;

  // 병원 이름 API 호출
  useEffect(() => {
    if (!hospitalId) return;
  
    const fetchHospitalName = async () => {
      try {
        const response = await axios.get(`/api/hospital/name/${hospitalId}`);
        setHospitalName(response.data);
      } catch (error) {
        console.error("Error fetching hospital name:", error);
        setHospitalName("병원 정보를 불러오지 못했습니다.");
      }
    };
  
    fetchHospitalName();
  }, [hospitalId]);

  // 분과 API
  useEffect(() => {
    const fetchMedicalStaff = async () => {
      try {
        const response = await axios.get<MedicalStaff[]>(`/api/medical-staff/${hospitalId}`);
        setMedicalStaffList(response.data);
      } catch (error){
        console.error("의료진 분과 데이터를 가져오는 중 오류 발생:", error);
      }
    };
    fetchMedicalStaff();
  }, [hospitalId]);


  // 메인화면 날짜, 시간 표시
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });


  // 스케줄 페이지에서 매크로 설정 이동
  useEffect(() => {
    if (location.state && location.state.macroMode) {
      setIsMacroMode(true);
    }
  }, [location]);

  // 스케줄 페이지에서 빠른 답변 설정 이동
  useEffect(() => {
    if (location.state && location.state.QAMode) {
      setIsQAMode(true);
    }
  }, [location]);


  const handleLogoClick = () => {
    setIsMacroMode(false);
    setIsQAMode(false);
    navigate('/nurse-main');
  };

  const handleMenuClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setIsDropdownVisible(prev => !prev);
  };

  const handleMacroClick = () => {
    setIsMacroMode(true);
    setIsQAMode(false);
    setIsDropdownVisible(false);
  };

  const handleQAClick = () => {
    setIsQAMode(true);
    setIsMacroMode(false);
    setIsDropdownVisible(false);
  };

  const handleMenuMoveClick = (path: string) => {
    setIsDropdownVisible(false);
    setIsMacroMode(false);
    setIsQAMode(false);
    navigate(path);
  };

  const handlePatientClick = (patientId: number) => {
    console.log("선택된 환자 ID:", patientId);
    setSelectedPatient(patientId);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  // 채팅 버튼 클릭 시 해당 환자 정보 이동
  const handleChatClick = (patientId: number) => {
    setIsMacroMode(false);
    setIsQAMode(false);

    console.log("채팅 버튼 클릭: 환자 ID", patientId);
    const patientDetail = patientDetails[patientId];
    const patientNameValue = patientDetail ? patientDetail.name : "Unknown";
    
    // nurseId, patientId 조합으로 conversationId 생성
    const conversationId = `${medicalStaffId}_${patientId}`;
    setCurrentRoom(conversationId);
    setPatientName(patientNameValue);
    setPatientId(patientId);

    // 채팅 기록이 없을때 새로운 빈 채팅방 생성
    const emptyRoom: ChatRoom = {  // create empty room
      userName: patientNameValue,
      conversationId: conversationId,
      previewMessage: '',
      lastMessageTime: '',
      isRead: false
    }

    // 존재하는 빈 채팅방 제거
    setRooms((prevRooms) => prevRooms.filter(room => !(room.lastMessageTime === '')));
    // 새로운 빈 채팅방 추가
    setRooms((prevRooms) => {

      // 해당 빈 채팅방이 이미 존재한다면
      const emptyRoomExists = prevRooms.some(room => room.conversationId === conversationId && room.previewMessage === '');

      // 해당 환자에 대한 채팅방이 이미 존재한다면 
      const roomExists = prevRooms.some(room => room.conversationId === conversationId);

      if (roomExists) {
        return [...prevRooms];
      }
      else if (emptyRoomExists) {
        return prevRooms.map(room => 
          room.conversationId === conversationId && room.previewMessage === '' ? emptyRoom : room
        );
      } else {
        return [...prevRooms, emptyRoom];
      }
    });
  };


  {/* 콜벨서비스 코드 시작 */}
  const convertStatus = (status: string): string => {
    if (status === "PENDING") return "대기 중";
    if (status === "COMPLETED") return "완료됨";
    if (status === "IN_PROGRESS") return "진행 중";
    if (status === "SCHEDULED") return "예약됨";
    return status;
  };

  useEffect(() => {
      const fetchRequests = async () => {
        try {
          const response = await fetch(`/api/call-bell/request/staff/${medicalStaffId}`);
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
        const response = await fetch(`/api/patient/user/${patientId}`);
        if (!response.ok) {
          console.error(`환자 상세 정보 API 에러 (ID: ${patientId})`, response.status);
          return;
        }
        const data: PatientDetail = await response.json();
        setPatientDetails((prev) => ({ ...prev, [patientId]: data }));
      } catch (error) {
        console.error(`환자 상세 정보 가져오기 실패 (ID: ${patientId})`, error);
      }
    };
  
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedStatus(e.target.value);
    };
  
    // 상태 우선순위
    const statusPriority = ['대기 중', '진행 중', '예약됨', '완료됨'];
  
    const filteredRequests =
      selectedStatus === "전체"
      ? [...requests].sort((a, b) =>
        statusPriority.indexOf(convertStatus(a.status)) - statusPriority.indexOf(convertStatus(b.status))
      )
    : requests.filter(req => convertStatus(req.status) === selectedStatus);

  {/* 콜벨서비스 코드 끝 */}


  {/* 메시지 관련 코드 시작 */}

  {/* Set constants */}
  const nurseId = "1";  // 테스트용 간호사 ID

  {/* State Variables */}
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);  // Loading state for chat history
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("Unknown");
  const [patientId, setPatientId] = useState<number>(5);
  const [isDataFetched, setIsDataFetched] = useState<boolean>(false);
  const currentRoomRef = useRef<string>("");  // Stores latest room

  {/* Handlers and Utility Functions */}

  // useEffect(() => {
  //   console.log("Messages updated:", messages);
  // }, [messages]);  
  
  const updateMessages = useCallback((newMessage: ChatMessage) => {
    setMessages((prevMessages) => {
      if (prevMessages.some(msg => msg.messageId === newMessage.messageId)) return prevMessages;
      return [...prevMessages, newMessage];
    });
  }, []);
    
  // Get chat history
  const fetchChatHistory = async (patientId: number) => {
    console.log("Fetching chat history...");
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/message/user?patientId=${patientId}`);
      if (!response.ok) throw new Error(`Failed to fetch messages for patient: ${patientId}`);
  
      const newMessages: ChatMessage[] = await response.json();
  
      setMessages((prevMessages) => {
        // Only update if messages have changed
        return JSON.stringify(prevMessages) !== JSON.stringify(newMessages)
          ? [...newMessages.reverse()]  // Reverse to maintain order
          : prevMessages;
      });
  
    } catch (error) {
      console.error("Failed to fetch chat history", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 콜벨 요청에서 patientId 모으기
    const requestPatientIds = requests.map((req) => req.patientId);

    // 채팅방에서 conversationId를 이용해 patientId 뽑기
    const chatPatientIds = rooms.map((room) => {
      return parsePatientId(room.conversationId);
    });

    // 중복 제거
    const allPatientIds = Array.from(new Set([...requestPatientIds, ...chatPatientIds]));

    // 아직 fetch하지 않은 환자만 fetch
    allPatientIds.forEach((id) => {
      if (id && !patientDetails[id]) {
        fetchPatientDetail(id);
      }
    });
  }, [requests, rooms]); // requests, rooms가 바뀔 때마다 실행
  
    
  // 웹소켓 연결 
  const { subscribeToRoom, sendMessage, isConnected } = useStompClient((message: any) => {
    // 들어오는 메시지 확인 
    if (message.type === "MESSAGE") {
      const chatMessage: ChatMessage = message as ChatMessage;
      console.log("Received a chat message:", chatMessage);
      console.log("Current room: ", currentRoomRef.current);
      if (message.chatRoomId == currentRoomRef.current) { // Only messages from patient will be added
        setMessages((prevMessages) => [...prevMessages, message]);
        console.log("Adding message to array");
      }
      fetchRooms();  // chatroom list 업데이트
    } else if (message.type === "REQUEST") {  // 메시지가 요청사항인지 확인 
      const request: CallBellRequest = message as CallBellRequest;
      console.log("Received a request message:", request);  
      // 요청 메시지 처리 (알림 띄우기)
      setRequestPopup(message as CallBellRequest); // 요청 메시지를 팝업에 저장
    } else if (message.messageType === "NOTIFICATION") {  // 읽음 표시 업데이트 
      console.log("Update read status");
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          !msg.isPatient && !msg.readStatus ? { ...msg, readStatus: true } : msg
        )
      );
      
      fetchRooms();  // chatroom list 업데이트

    } else {
      console.warn("Unknown message type:", message);
    }
  });

  // Fetch chatrooms from the server
  const fetchRooms = async () => {
    try {
      const response = await fetch(`/api/chat/message/main/${nurseId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        const body = await response.text();
        throw new Error(`Expected JSON response but received: ${body}`);
      }

      const roomsData: ChatRoom[] = await response.json();
      setRooms((prevRooms) => {
        const emptyRooms = prevRooms.filter(room => room.previewMessage === ''); // Keep old empty rooms
        const updatedRooms = roomsData.filter(room => room.previewMessage !== ''); // New fetched rooms with messages
      
        // Merge fetched rooms with existing empty rooms
        return [...emptyRooms, ...updatedRooms];
      });
      
      setIsDataFetched(true);
      console.log("Room fetched: ", roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Add sample rooms if data is not fetched (for testing)
  const addSampleRooms = () => {
    const sampleRooms: ChatRoom[] = [
      {
        userName: "홍길동",
        conversationId: "1_5",
        previewMessage: "물 요청",
        lastMessageTime: "2025-01-20T09:15:00Z",
        isRead: false,
      },
    ];

    if (!isDataFetched) {
      setRooms(sampleRooms);
    }
  };

  // Handle room selection and update the patient data
  const handleRoomSelect = (roomId: string) => {
    setCurrentRoom(roomId);
    console.log("Current room set: ", roomId);
    const selectedRoom = rooms.find(room => room.conversationId === roomId);
    if (selectedRoom) {
      setPatientName(selectedRoom.userName);
      const patientId = parseInt(roomId.split('_')[1]);
      setPatientId(patientId);
    }
    // If selected room is not empty room remove empty room
    if (selectedRoom?.lastMessageTime != '') {
      setRooms((prevRooms) => prevRooms.filter(room => !(room.lastMessageTime === '')));
    }
  };

  // Remove empty rooms when leaving chat room (back click)
  const removeEmptyRoom = (conversationId: string) => {
    setRooms((prevRooms) => prevRooms.filter(room => !(room.conversationId === conversationId && room.lastMessageTime === '')));
  };  

  // Function to mark message as read
  const markMessageAsRead = async (messageId: number) => {
    console.log("Marking message as read.");
    try {
      const url = `/api/chat/message/read?messageId=${messageId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if the response is successful (status code 2xx)
      if (!response.ok) {
        // If response status is not OK, throw an error with status text
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Update local state after marking as read
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.messageId === messageId ? { ...message, readStatus: true } : message
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };


  {/* Hooks */}

  useEffect(() => {
    currentRoomRef.current = currentRoom;  // Update ref when state changes
    console.log("Updated currentRoomRef:", currentRoomRef.current);
  }, [currentRoom]);

  // 웹소켓 연결되면 간호사 채널에 구독
  useEffect(() => {
    if (!isConnected) return;
    subscribeToRoom(`/sub/user/chat/${nurseId}`); 
  }, [isConnected]);

  // Fetch chat rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  {/* 메시지 관련 코드 끝 */}


  return (
    /* 전체 창*/
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
      {/*<div className="fixed inset-0 flex items-center justify-center z-40">
        <button
          onClick={handleTestRequest}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md text-lg hover:bg-blue-700"
        >
          테스트 요청 보내기
        </button>
      </div>*/}


      {/* 메뉴바 아이콘 */}
      <div className="h-full w-1/5 p-6 mr-4 rounded-lg overflow-hidden bg-[#F0F4FA]">
        <div className="flex items-center mb-4" style={{ marginTop: '-60px' }}>
        {isDropdownVisible ? (
          <FiChevronsDown
            className="relative w-[2.3em] h-[2.3em] mr-2 cursor-pointer"
            onClick={handleMenuClick}
          />
        ) : (
          <FiMenu
            className="relative w-[2.3em] h-[2.3em] mr-2 cursor-pointer"
            onClick={handleMenuClick}
          />
        )}

        {/* 메뉴바 클릭 시 팝업 */}
          {isDropdownVisible && (
            <div className="absolute top-[2.5em] left-[0px] mt-2 w-[200px] bg-white shadow-lg rounded-md border"
                 style={{ top: dropdownPosition.top, left: dropdownPosition.left }}>
              <p className="text-black text-[15px] font-semibold pt-2 px-2">
                {hospitalName ? hospitalName : "Loading..."}
              </p>
              <p className="text-gray-500 text-[13px] pt-1 pb-2 px-2">
              {medicalStaffList.length > 0 ? medicalStaffList[0].department : "Loading..."}
              </p>
              <hr className="bg-gray-600" />

              <ul className="py-2">
                <li className="px-2 pt-2 pb-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleMenuMoveClick("/nurse-main")}>
                  <FiHome className="w-4 h-4 mr-2" />메인 화면
                </li>
                <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleMenuMoveClick("/nurse-schedule")}>
                  <FiCalendar className="w-4 h-4 mr-2" />스케줄러
                </li>
                <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={handleMacroClick}>
                  <FiCpu className="w-4 h-4 mr-2" />매크로 설정
                </li>
                <li className="px-2 pt-1 pb-2 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={handleQAClick}>
                  <BsStopwatch className="w-4 h-4 mr-2" />빠른 답변 설정
                </li>
                <hr className="bg-gray-600" />

                <li className="px-2 pt-2 pb-1 text-[13px] text-gray-500 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleMenuMoveClick("/nurse-reset-password")}>비밀번호 재설정</li>
                <li className="px-2 py-1 text-[13px] text-gray-500 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleMenuMoveClick("/nurse-login")}>로그아웃</li>
              </ul>
            </div>
          )}

          <img src={logo} alt="CareBridge 로고" className="w-[7.5em] h-[7.5em] cursor-pointer" onClick={handleLogoClick} />
        </div>

        {/* 날짜 표시 영역 */}
        <div className="flex text-center text-gray-600 mb-4" style={{ marginTop: '-40px' }}>
          <p className="text-black font-semibold mr-2">{formattedDate}</p>
          <p className="text-gray-600 font-[12px]">{formattedTime}</p>
        </div>

        {/* 병원 정보 표시 영역 */}
        <p className="text-black font-semibold">{hospitalName ? hospitalName : "Loading..."}</p>
        <p className="text-gray-600 text-[12px]">{medicalStaffList.length > 0 ? medicalStaffList[0].department : "Loading..."}</p>

        {/* 콜벨 서비스 영역 */}
        <div className="flex justify-end bg-[#98B3C8] w-full h-[40px] mt-4 pl-20 pr-3 rounded-tl-md rounded-tr-md">
          <select value={selectedStatus} onChange={handleStatusChange} className="items-center w-[120px] border border-gray-400 m-1.5 rounded cursor-pointer">
            <option value="전체">전체</option>
            <option value="대기 중">대기 중</option>
            <option value="진행 중">진행 중</option>
            <option value="예약됨">예약됨</option>
            <option value="완료됨">완료됨</option>
          </select>
        </div>

        <div className="flex-grow h-[670px] overflow-y-auto scrollbar-hide">
          {filteredRequests.map(request => {
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
                      displayStatus === "대기 중"
                        ? "bg-[#F8F8F8] border border-[#E3E3E3]"
                        : displayStatus === "진행 중"
                        ? "bg-[#417BB4] border border-[#306292] text-white"
                        : displayStatus === "예약됨"
                        ? "bg-[#C75151] border border-[#B14141] text-white"
                        : displayStatus === "완료됨"
                        ? "bg-[#E3E3E3] border border-[#CFC9C9]"
                        : "bg-gray-300"
                    }`}
                  >
                    {displayStatus}
                  </h2>
                  <button 
                    className="px-4 py-1 bg-gray-400 text-sm font-semibold rounded"
                    onClick={() => handleChatClick(request.patientId)}
                  >
                    채팅
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 매크로, 빠른 답변 화면 전환 */}
      {isMacroMode ? (
        <div className="flex-1 relative w-full">
          <NurseMacroList medicalStaffId={Number(medicalStaffId)} />
        </div>
      ) : isQAMode ? (
        <div className="flex-1 relative w-full">
          <NurseQuickAnswerList hospitalId={Number(hospitalId)} />
        </div>
      ) : (
        <>
          <NurseMessaging
            messages={messages}
            sendMessage={sendMessage}
            isConnected={isConnected}
            markMessageAsRead={markMessageAsRead}
            rooms={rooms}
            currentRoom={currentRoom} // conversationId 전달
            onRoomSelect={handleRoomSelect}
            patientName={patientName}
            patientId={patientId}
            subscribeToRoom={subscribeToRoom}
            fetchChatHistory={fetchChatHistory}
            updateMessages={updateMessages}
            removeEmptyRoom={removeEmptyRoom}
            patientDetails={patientDetails}
          />

          {/* 환자 정보 및 스케줄러 영역 */}
          <div className="w-1/5 flex flex-col space-y-6">
            <div className="bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-1 mb-1">
              {selectedPatient !== null ? (
                <Nurse_DetailedPatientInfo patientId={selectedPatient} onBack={handleBackToList} onChatClick={(id) => handleChatClick(id)} />
              ) : (
                <NursePatientInfo onPatientClick={handlePatientClick} />
              )}
            </div>
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
