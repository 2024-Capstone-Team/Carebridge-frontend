import { useState, useEffect, useRef, createContext, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSnackbar } from 'notistack';
import NurseSchedule from "../../components/nurse/NurseSchedule"
import NursePatientInfo from "../../components/nurse/NursePatientInfo"
import Nurse_DetailedPatientInfo from "../../components/nurse/NurseDetailedPatientInfo"
import NurseMacroList from "../../components/nurse/NurseMacroList"
import NurseQuickAnswerList from "../../components/nurse/NurseQuickAnswerList"
import NurseMessaging from "../../components/nurse/NurseMessaging"
import logo from "../../assets/carebridge_logo.png"
import { FiMenu, FiChevronsDown, FiHome, FiCalendar, FiCpu, FiX } from "react-icons/fi"
import { BsStopwatch } from "react-icons/bs"
import useStompClient from "../../hooks/useStompClient"
import type { ChatMessage, CallBellRequest, PatientDetail, ChatRoom, MedicalStaff } from "../../types"
import axios from "axios"
import { useUserContext } from "../../context/UserContext"
import { calculateAge, formatGender, formatTime } from "../../utils/commonUtils.ts"
import Button from "../../components/common/Button.tsx";

const WebSocketContext = createContext(null)

// conversationId에서 patientId 추출
function parsePatientId(conversationId: string) {
  const parts = conversationId.split("_")
  if (parts.length < 2) return 0
  return Number.parseInt(parts[1], 10)
}

function getKstIso(): string {
  const now = new Date()
  const tzOffsetMS = now.getTimezoneOffset() * 60 * 1000
  const localTime = new Date(now.getTime() - tzOffsetMS)
  return localTime.toISOString().replace("Z", "+09:00")
}

const NurseMainPage: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

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
  const [isTimeSelection, setIsTimeSelection] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const [requestPopup, setRequestPopup] = useState<CallBellRequest | null>(null) // 요청사항 팝업
  const [isDropdownVisible, setIsDropdownVisible] = useState(false) // 메뉴 팝업 표시
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 }) // 메뉴바 위치 설정
  const [isMacroMode, setIsMacroMode] = useState(false) // 매크로 설정 화면 여부
  const [isQAMode, setIsQAMode] = useState(false) // 빠른 답변 모드 설정 화면 여부
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null) // 환자 정보 선택 상태
  const [hospitalName, setHospitalName] = useState("") // 불러올 병원 이름
  const [medicalStaffList, setMedicalStaffList] = useState<MedicalStaff[]>([]) // 분과 이름
  const [requests, setRequests] = useState<CallBellRequest[]>([])
  const [selectedStatus, setSelectedStatus] = useState("전체")
  const [patientDetails, setPatientDetails] = useState<{ [key: number]: PatientDetail }>({})
  const [currentTime, setCurrentTime] = useState(new Date())

  const [pendingRequest, setPendingRequest] = useState<CallBellRequest | null>(null)
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleTime, setScheduleTime] = useState<string>("")

  const navigate = useNavigate()
  const location = useLocation()

  const hospitalId = Number(useUserContext()?.hospitalId || 1);
  const medicalStaffId = 1

  // 병원 이름 API 호출
  useEffect(() => {
    if (!hospitalId) return

    const fetchHospitalName = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/hospital/name/${hospitalId}`)
        setHospitalName(response.data)
      } catch (error) {
        console.error("Error fetching hospital name:", error)
        setHospitalName("병원 정보를 불러오지 못했습니다.")
      }
    }

    fetchHospitalName()
  }, [hospitalId])

  // 분과 API
  useEffect(() => {
    const fetchMedicalStaff = async () => {
      try {
        const response = await axios.get<MedicalStaff[]>(`${API_BASE_URL}/api/medical-staff/${hospitalId}`)
        setMedicalStaffList(response.data)
      } catch (error) {
        console.error("의료진 분과 데이터를 가져오는 중 오류 발생:", error)
      }
    }
    fetchMedicalStaff()
  }, [hospitalId])

  // 메인화면 현재 시각 표시
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timerId)
  }, [])

  const formattedDate = currentTime.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const formattedTime = currentTime.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // 스케줄 페이지에서 매크로/빠른 답변 설정 이동
  useEffect(() => {
    if (location.state?.macroMode) setIsMacroMode(true)
    if (location.state?.QAMode) setIsQAMode(true)
  }, [location])

  const handleLogoClick = () => {
    setIsMacroMode(false)
    setIsQAMode(false)
    navigate("/nurse-main")
  }

  const handleMenuClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left })
    setIsDropdownVisible((prev) => !prev)
  }

  const handleMacroClick = () => {
    setIsMacroMode(true)
    setIsQAMode(false)
    setIsDropdownVisible(false)
  }

  const handleQAClick = () => {
    setIsQAMode(true)
    setIsMacroMode(false)
    setIsDropdownVisible(false)
  }

  const handleMenuMoveClick = (path: string) => {
    setIsDropdownVisible(false)
    setIsMacroMode(false)
    setIsQAMode(false)
    navigate(path)
  }

  const handlePatientClick = (patientId: number) => {
    console.log("선택된 환자 ID:", patientId)
    setSelectedPatient(patientId)
  }

  const handleBackToList = () => {
    setSelectedPatient(null)
  }

  // Check if chatroom exists
  const checkIfChatroomExists = useCallback(async (patientId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patient/chatroom/${patientId}`)
      if (!response.ok) throw new Error(`Failed to check if chatroom exists: ${response.status}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error checking chatroom existence:", error)
      return false
    }
  }, [])

  const getPatientDetailsForChat = useCallback(async (patientId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patient/user/${patientId}`)
      if (!response.ok) throw new Error(`Failed to fetch patient details: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error("Error fetching patient details:", error)
      return null
    }
  }, [])

  const createChatroom = useCallback(async (patientId: number, department: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, department }),
      })
      if (!response.ok) throw new Error(`Failed to create chatroom: ${response.status}`)
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error("Error creating chatroom:", error)
      return false
    }
  }, [])

  // 채팅 버튼 클릭 시 해당 환자 정보 이동
  const handleChatClick = async (patientId: number) => {
    setIsMacroMode(false)
    setIsQAMode(false)

    // Ensure chatroom exists (logic from PatientChatPage)
    const patient = await getPatientDetailsForChat(patientId)
    if (patient) {
      const exists = await checkIfChatroomExists(patientId)
      if (!exists) {
        await createChatroom(patientId, "내과")
      }
    }

    console.log("채팅 버튼 클릭: 환자 ID", patientId)
    const patientDetail = patientDetails[patientId]
    const patientNameValue = patientDetail ? patientDetail.name : "Unknown"

    // nurseId, patientId 조합으로 conversationId 생성
    const conversationId = `${medicalStaffId}_${patientId}`
    setCurrentRoom(conversationId)
    setPatientName(patientNameValue)
    setPatientId(patientId)

    // 채팅 기록이 없을때 새로운 빈 채팅방 생성
    const emptyRoom: ChatRoom = {
      // create empty room
      userName: patientNameValue,
      conversationId: conversationId,
      previewMessage: "",
      lastMessageTime: "",
      isRead: false,
    }

    // 존재하는 빈 채팅방 제거
    setRooms((prevRooms) => prevRooms.filter((room) => !(room.lastMessageTime === "")))
    // 새로운 빈 채팅방 추가
    setRooms((prevRooms) => {
      // 해당 빈 채팅방이 이미 존재한다면
      const emptyRoomExists = prevRooms.some(
        (room) => room.conversationId === conversationId && room.previewMessage === "",
      )

      // 해당 환자에 대한 채팅방이 이미 존재한다면
      const roomExists = prevRooms.some((room) => room.conversationId === conversationId)

      if (roomExists) {
        return [...prevRooms]
      } else if (emptyRoomExists) {
        return prevRooms.map((room) =>
          room.conversationId === conversationId && room.previewMessage === "" ? emptyRoom : room,
        )
      } else {
        return [...prevRooms, emptyRoom]
      }
    })
  }

  // 콜벨 서비스 요청 조회
  useEffect(() => {
    axios
      .get<CallBellRequest[]>(`${API_BASE_URL}/api/call-bell/request/staff/${medicalStaffId}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("호출 요청 조회 실패:", err))
  }, [API_BASE_URL, medicalStaffId])

  // 환자 정보 조회
  useEffect(() => {
    const ids = Array.from(new Set(requests.map((r) => r.patientId)))
    ids.forEach((id) => {
      if (!patientDetails[id]) {
        axios
          .get<PatientDetail>(`${API_BASE_URL}/api/patient/user/${id}`)
          .then((res) =>
            setPatientDetails((prev) => ({
              ...prev,
              [id]: res.data,
            })),
          )
          .catch((err) => console.error(`환자 상세 정보 조회 실패 (ID=${id}):`, err))
      }
    })
  }, [API_BASE_URL, requests, patientDetails])

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value)
  }

  const convertStatus = (status: string): string => {
    if (status === "PENDING") return "대기 중"
    if (status === "COMPLETED") return "완료됨"
    if (status === "IN_PROGRESS") return "진행 중"
    if (status === "SCHEDULED") return "예약됨"
    return status
  }

  // 상태 우선순위
  const statusPriority = ["대기 중", "진행 중", "예약됨", "완료됨"]

  const filteredRequests =
    selectedStatus === "전체"
      ? [...requests].sort(
          (a, b) => statusPriority.indexOf(convertStatus(a.status)) - statusPriority.indexOf(convertStatus(b.status)),
        )
      : requests.filter((req) => convertStatus(req.status) === selectedStatus)

  // 대기 중 버튼 클릭 시
  const openPendingModal = (req: CallBellRequest) => {
    setPendingRequest(req)
    setIsPendingModalOpen(true)
  }

  const closeAllModals = () => {
    setIsPendingModalOpen(false)
    setIsScheduleModalOpen(false)
    setPendingRequest(null)
  }

  // 팝업: 수락 클릭 시
  const handleAccept = () => {
    if (!pendingRequest) return
    const acceptTime = getKstIso()

    axios
      .patch(
        `${API_BASE_URL}/api/call-bell/request/${pendingRequest.requestId}` +
          `?acceptTime=${encodeURIComponent(acceptTime)}`,
      )
      .then(() =>
        axios.put(`${API_BASE_URL}/api/call-bell/request/status/${pendingRequest.requestId}` + `?status=IN_PROGRESS`),
      )
      .then(() => {
        setRequests((prev) =>
          prev.map((r) => (r.requestId === pendingRequest.requestId ? { ...r, status: "IN_PROGRESS", acceptTime } : r)),
        )
        closeAllModals()
      })
      .catch((e) => {
        console.error(e)
        alert("수락 처리 실패")
      })
  }

  // 팝업: 보류 클릭 시
  const handleHold = () => {
    setIsPendingModalOpen(false)
    setScheduleTime("")
    setIsScheduleModalOpen(true)
  }

  // 예약 시간 설정
  const handleScheduleConfirm = () => {
    if (!pendingRequest || !scheduleTime) return

    const requestDate = new Date(pendingRequest.requestTime)
    const [hour, minute] = scheduleTime.split(":").map(Number)
    requestDate.setHours(hour, minute, 0, 0)

    const tzOffsetMS = requestDate.getTimezoneOffset() * 60 * 1000
    const localSched = new Date(requestDate.getTime() - tzOffsetMS)
    const acceptTime = localSched.toISOString().replace("Z", "+09:00")

    axios
      .patch(
        `${API_BASE_URL}/api/call-bell/request/${pendingRequest.requestId}` +
          `?acceptTime=${encodeURIComponent(acceptTime)}`,
      )
      .then(() =>
        axios.put(`${API_BASE_URL}/api/call-bell/request/status/${pendingRequest.requestId}` + `?status=SCHEDULED`),
      )
      .then(() => {
        setRequests((prev) =>
          prev.map((r) => (r.requestId === pendingRequest.requestId ? { ...r, status: "SCHEDULED", acceptTime } : r)),
        )
        closeAllModals()
      })
      .catch((e) => {
        console.error(e)
        alert("예약 처리 실패")
      })
  }

  // 진행 중 -> 완료됨 처리
  const handleMarkComplete = (requestId: number) => {
    if (!window.confirm("요청을 완료하시겠습니까?")) return

    axios
      .put(`${API_BASE_URL}/api/call-bell/request/status/${requestId}?status=COMPLETED`)
      .then(() => {
        setRequests((prev) => prev.map((r) => (r.requestId === requestId ? { ...r, status: "COMPLETED" } : r)))
      })
      .catch((err) => {
        console.error(err)
        alert("상태 업데이트 실패")
      })
  }

  // 예약됨 -> 완료됨
  useEffect(() => {
    const timer = setInterval(() => {
      requests.forEach((req) => {
        if (req.status === "SCHEDULED" && req.acceptTime) {
          const acceptTs = new Date(req.acceptTime).getTime()

          // 30분 초과
          if (Date.now() - acceptTs > 30 * 60 * 1000) {
            axios
              .put(`${API_BASE_URL}/api/call-bell/request/status/${req.requestId}?status=COMPLETED`)
              .then(() => {
                setRequests((prev) =>
                  prev.map((r) => (r.requestId === req.requestId ? { ...r, status: "COMPLETED" } : r)),
                )
              })
              .catch((e) => console.error(`자동 완료 실패 (ID=${req.requestId}):`, e))
          }
        }
      })
    }, 60_000)
    return () => clearInterval(timer)
  }, [requests])
  ;<div className="mt-4 rounded-lg overflow-hidden shadow-sm">
    <div className="flex justify-between items-center bg-white w-full h-[45px] px-3 rounded-t-lg border-b border-gray-200">
      <h3 className="text-[#417BB4] font-semibold text-sm">콜벨 서비스</h3>
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="text-xs bg-white border border-gray-200 rounded-md py-1 px-2 cursor-pointer focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
      >
        <option value="전체">전체</option>
        <option value="대기 중">대기 중</option>
        <option value="진행 중">진행 중</option>
        <option value="예약됨">예약됨</option>
        <option value="완료됨">완료됨</option>
      </select>
    </div>

    {/* 콜벨 요청 리스트 */}
    <div className="flex-col max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide bg-white">
      {filteredRequests.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">요청 사항이 없습니다</div>
      ) : (
        filteredRequests.map((request) => {
          const name = patientDetails[request.patientId]?.name ?? "알 수 없음"
          const requestTime = formatTime(request.requestTime)
          const acceptTime = request.acceptTime ? formatTime(request.acceptTime) : "대기 중"
          const displayStatus = convertStatus(request.status)
          const isInProgress = request.status === "IN_PROGRESS"
          const isPending = request.status === "PENDING"
          const isScheduled = request.status === "SCHEDULED"

          return (
            <div key={request.requestId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="p-3">
                <div className="flex justify-between items-start w-full mb-1">
                  <div className="flex items-center">
                    <span className="font-bold text-[15px] mr-2">{name}</span>
                    {patientDetails[request.patientId] && (
                      <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {formatGender(patientDetails[request.patientId].gender)}{" "}
                        {calculateAge(patientDetails[request.patientId].birthDate)}세
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end text-[10px] text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-1">요청:</span>
                      <span className="font-medium">{requestTime}</span>
                    </div>
                    {request.acceptTime && (
                      <div className="flex items-center">
                        <span className="mr-1">예약:</span>
                        <span className="font-medium">{acceptTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[12px] text-gray-700 mb-2 line-clamp-2">{request.requestContent}</p>

                <div className="flex justify-end items-center gap-2">
                  <button
                    onClick={() =>
                      isPending
                        ? openPendingModal(request)
                        : isInProgress
                          ? handleMarkComplete(request.requestId)
                          : undefined
                    }
                    className={`
                      px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200
                      ${
                        isPending
                        ? "bg-[#F8F8F8] border border-[#E3E3E3] hover:bg-gray-200"
                        : isInProgress
                        ? "bg-[#417BB4] border border-[#306292] text-white hover:bg-[#2c5a8c]"
                        : isScheduled
                          ? "bg-[#C75151] border border-[#B14141] text-white hover:bg-[#a83e3e]"
                          : "bg-[#E3E3E3] border border-[#CFC9C9]"
                        }
                        ${isPending || isInProgress ? "cursor-pointer" : "cursor-default"}
                        `}
                        >
                        {displayStatus}
                        </button>
                          
                        <button
                        className="px-3 py-1 bg-gray-400 text-white text-xs font-medium rounded-md transition-all duration-200 hover:bg-gray-500"
                        onClick={() => handleChatClick(request.patientId)}
                      >
                        채팅
                      </button>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  </div>

  const nurseId = "1"  // temporary for testing
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true) // Loading state for chat history
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState<string>("")
  const [patientName, setPatientName] = useState<string>("Unknown")
  const [patientId, setPatientId] = useState<number>(5)
  const [isDataFetched, setIsDataFetched] = useState<boolean>(false)
  const currentRoomRef = useRef<string>("") // Stores latest room

  // useEffect(() => {
  //   console.log("Messages updated:", messages);
  // }, [messages]);

  const updateMessages = useCallback((newMessage: ChatMessage) => {
    setMessages((prevMessages) => {
      const exists = prevMessages.some((msg) => msg.messageId === newMessage.messageId);
      if (exists) {
        return prevMessages.map((msg) =>
          msg.messageId === newMessage.messageId ? { ...msg, ...newMessage } : msg
        );
      }
      return [...prevMessages, newMessage].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });
  }, []);

  // Get chat history
  const fetchChatHistory = async (patientId: number) => {
    console.log("Fetching chat history...")
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/chat/message/user?patientId=${patientId}`)
      if (!response.ok) throw new Error(`Failed to fetch messages for patient: ${patientId}`)

      const newMessages: ChatMessage[] = await response.json()

      setMessages((prevMessages) => {
        // Only update if messages have changed
        return JSON.stringify(prevMessages) !== JSON.stringify(newMessages)
          ? [...newMessages.reverse()] // Reverse to maintain order
          : prevMessages
      })
    } catch (error) {
      console.error("Failed to fetch chat history", error)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 콜벨 요청에서 patientId 모으기
    const requestPatientIds = requests.map((req) => req.patientId)

    // 채팅방에서 conversationId를 이용해 patientId 뽑기
    const chatPatientIds = rooms.map((room) => parsePatientId(room.conversationId))

    // 중복 제거
    const allPatientIds = Array.from(new Set([...requestPatientIds, ...chatPatientIds]))

    allPatientIds.forEach((id) => {
      if (id && !patientDetails[id]) {
        axios
          .get<PatientDetail>(`${API_BASE_URL}/api/patient/user/${id}`)
          .then((res) => {
            setPatientDetails((prev) => ({
              ...prev,
              [id]: res.data,
            }))
          })
          .catch((err) => {
            console.error(`환자 상세정보 조회 실패 (ID=${id}):`, err)
          })
      }
    })
  }, [API_BASE_URL, requests, rooms, patientDetails]) // requests, rooms가 바뀔 때마다 실행

  // 웹소켓 연결
  const { subscribeToRoom, sendMessage, isConnected } = useStompClient((message: any) => {
    // 들어오는 메시지 확인
    if (message.type === "MESSAGE") {
      const chatMessage: ChatMessage = message as ChatMessage
      console.log("Received a chat message:", chatMessage)
      console.log("Current room: ", currentRoomRef.current)
      if (message.chatRoomId == currentRoomRef.current) {
        fetchChatHistory(patientId);
      }
      fetchRooms() // chatroom list 업데이트
    } else if (message.type === "REQUEST") {
      // 메시지가 요청사항인지 확인
      const request: CallBellRequest = message as CallBellRequest
      console.log("Received a request message:", request)
      // 요청 메시지 처리 (알림 띄우기)
      setRequestPopup(message as CallBellRequest) // 요청 메시지를 팝업에 저장
      fetchRooms() // chatroom list 업데이트
    } else if (message.messageType === "NOTIFICATION") {
      // 읽음 표시 업데이트
      console.log("Update read status")
      messages.forEach((msg) => {
        if (!msg.isPatient && !msg.readStatus) {
          updateMessages({ ...msg, readStatus: true });
        }
      });

      fetchRooms() // chatroom list 업데이트
    } else {
      console.warn("Unknown message type:", message)
    }
  })

  // Fetch chatrooms from the server
  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message/main/${nurseId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`)
      }

      const contentType = response.headers.get("Content-Type")
      if (!contentType || !contentType.includes("application/json")) {
        const body = await response.text()
        throw new Error(`Expected JSON response but received: ${body}`)
      }

      const roomsData: ChatRoom[] = await response.json()
      setRooms((prevRooms) => {
        const emptyRooms = prevRooms.filter((room) => room.previewMessage === "") // Keep old empty rooms
        const updatedRooms = roomsData.filter((room) => room.previewMessage !== "") // New fetched rooms with messages

        // Merge fetched rooms with existing empty rooms
        return [...emptyRooms, ...updatedRooms]
      })

      setIsDataFetched(true)
      console.log("Room fetched: ", roomsData)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    }
  }

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
    ]

    if (!isDataFetched) {
      setRooms(sampleRooms)
    }
  }

  // Handle room selection and update the patient data
  const handleRoomSelect = (roomId: string) => {
    setCurrentRoom(roomId)
    console.log("Current room set: ", roomId)
    const selectedRoom = rooms.find((room) => room.conversationId === roomId)
    if (selectedRoom) {
      setPatientName(selectedRoom.userName)
      const patientId = Number.parseInt(roomId.split("_")[1])
      setPatientId(patientId)
    }
    // If selected room is not empty room remove empty room
    if (selectedRoom?.lastMessageTime != "") {
      setRooms((prevRooms) => prevRooms.filter((room) => !(room.lastMessageTime === "")))
    }
  }

  // Remove empty rooms when leaving chat room (back click)
  const removeEmptyRoom = (conversationId: string) => {
    setRooms((prevRooms) =>
      prevRooms.filter((room) => !(room.conversationId === conversationId && room.lastMessageTime === "")),
    )
  }

  // Function to mark message as read
  const markMessageAsRead = async (messageId: number) => {
    console.log("Marking message as read.")
    try {
      const url = `${API_BASE_URL}/api/chat/message/read?messageId=${messageId}`
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Check if the response is successful (status code 2xx)
      if (!response.ok) {
        // If response status is not OK, throw an error with status text
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      // Update local state after marking as read
      setMessages((prevMessages) =>
        prevMessages.map((message) => (message.messageId === messageId ? { ...message, readStatus: true } : message)),
      )
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  useEffect(() => {
    currentRoomRef.current = currentRoom // Update ref when state changes
    console.log("Updated currentRoomRef:", currentRoomRef.current)
  }, [currentRoom])

  // 웹소켓 연결되면 간호사 채널에 구독
  useEffect(() => {
    if (!isConnected) return
    subscribeToRoom(`/sub/user/chat/${nurseId}`)
  }, [isConnected])

  useEffect(() => {
    if (!isConnected || !currentRoom) return;
    subscribeToRoom(`/sub/chat/room/${currentRoom}`);
  }, [currentRoom, isConnected]);

  // Fetch chat rooms on mount
  useEffect(() => {
    fetchRooms()
  }, [])

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

  // 요청 목록 최신화 함수
  const fetchUpdatedRequests = async () => {
    try {
      const res = await axios.get<CallBellRequest[]>(`${API_BASE_URL}/api/call-bell/request/staff/${medicalStaffId}`);
      setRequests(res.data);
    } catch (err) {
      console.error("요청 목록 갱신 실패:", err);
    }
  };

  // 알림 처리 완료 시 호출되는 함수들 수정
  const handlePending = async (requestId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/call-bell/request/status/${requestId}?status=PENDING`, {
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
      // 요청 목록 갱신
      fetchUpdatedRequests();
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
      
      const timeResponse = await fetch(`${API_BASE_URL}/api/call-bell/request/${requestPopup.requestId}?acceptTime=${now.toISOString()}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!timeResponse.ok) {
        throw new Error('시간 설정에 실패했습니다.');
      }

      const statusResponse = await fetch(`${API_BASE_URL}/api/call-bell/request/status/${requestPopup.requestId}?status=SCHEDULED`, {
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
      // 요청 목록 갱신
      fetchUpdatedRequests();

      // After sending, refresh the chat history and room list instead of appending a mock message manually
      if (chatRoomId === currentRoomRef.current) {
        await fetchChatHistory(requestPopup.patientId);
      }
      await fetchRooms();

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
    /* 전체 창*/
    <div className="flex h-screen bg-gray-100 p-2">
       {/* ===== 요청 메시지 팝업 컨테이너 ===== */}
      {requestPopup && patientDetails[requestPopup.patientId] && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40"></div>
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
                  <Button 
                    onClick={() => handlePending(requestPopup.requestId)}
                    variant="cancel"
                    size='large'
                  >
                    보류
                  </Button>
                  <Button 
                    onClick={() => {
                      handleChatClick(requestPopup.patientId);
                      handleCloseNotification(); // Close the popup to match other chat buttons
                    }}
                    variant="chat"
                    size='large'
                  >
                    채팅
                  </Button>
                  <Button 
                    onClick={handleAcceptClick}
                    variant="save"
                    size='large'
                  >
                    수락
                  </Button>
                </div>
              )}
            </div>
          </div>
          </div>
        </>
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
      <div className="h-full w-1/5 p-3 mr-2 rounded-lg overflow-hidden bg-[#F0F4FA] flex flex-col">
        <div className="flex items-center mb-2" style={{ marginTop: "-40px" }}>
          {isDropdownVisible ? (
            <FiChevronsDown className="relative w-[2.3em] h-[2.3em] mr-2 cursor-pointer" onClick={handleMenuClick} />
          ) : (
            <FiMenu className="relative w-[2.3em] h-[2.3em] mr-2 cursor-pointer" onClick={handleMenuClick} />
          )}

          {/* 메뉴바 클릭 시 팝업 */}
          {isDropdownVisible && (
            <div
              className="absolute top-[2.5em] left-[0px] mt-2 w-[200px] bg-white shadow-lg rounded-md border"
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
            >
              <p className="text-black font-semibold pt-2 px-2" style={{ fontSize: "var(--font-body)" }}>
                {hospitalName ? hospitalName : "Loading..."}
              </p>
              <p className="text-gray-500 pt-1 pb-2 px-2" style={{ fontSize: "var(--font-caption)" }}>
                {medicalStaffList.length > 0 ? medicalStaffList[0].department : "Loading..."}
              </p>
              <hr className="bg-gray-600" />

              <ul className="py-2">
                <li
                  className="px-2 pt-2 pb-1 font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                  style={{ fontSize: "var(--font-caption)" }}
                  onClick={() => handleMenuMoveClick("/nurse-main")}
                >
                  <FiHome className="w-4 h-4 mr-2" />
                  메인 화면
                </li>
                <li
                  className="px-2 py-1 font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                  style={{ fontSize: "var(--font-caption)" }}
                  onClick={() => handleMenuMoveClick("/nurse-schedule")}
                >
                  <FiCalendar className="w-4 h-4 mr-2" />
                  스케줄러
                </li>
                <li
                  className="px-2 py-1 font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                  style={{ fontSize: "var(--font-caption)" }}
                  onClick={handleMacroClick}
                >
                  <FiCpu className="w-4 h-4 mr-2" />
                  매크로 설정
                </li>
                <li
                  className="px-2 pt-1 pb-2 font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                  style={{ fontSize: "var(--font-caption)" }}
                  onClick={handleQAClick}
                >
                  <BsStopwatch className="w-4 h-4 mr-2" />
                  빠른 답변 설정
                </li>
                <hr className="bg-gray-600" />

                <li
                  className="px-2 pt-2 pb-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
                  style={{ fontSize: "var(--font-caption)" }}
                  onClick={() => handleMenuMoveClick("/nurse-reset-password")}
                >
                  비밀번호 재설정
                </li>
                <li
                  className="px-2 py-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
                  style={{ fontSize: "var(--font-caption)" }}
                  onClick={() => handleMenuMoveClick("/nurse-login")}
                >
                  로그아웃
                </li>
              </ul>
            </div>
          )}

          <div className="flex w-full">
            <img src={logo} alt="CareBridge 로고" className="w-[120px] cursor-pointer" onClick={handleLogoClick}/>
          </div>
        </div>

        {/* 날짜 표시 영역 */}
        <div className="flex text-center text-[16px] text-gray-600 mb-2" style={{ marginTop: "-24px" }}>
          <p className="text-black font-semibold mr-2">{formattedDate}</p>
          <p className="text-gray-600">{formattedTime}</p>
        </div>

        {/* 병원 정보 표시 영역 */}
        <p className="text-black text-[16px] font-semibold">{hospitalName ? hospitalName : "Loading..."}</p>
        <p className="text-gray-600 " style={{ fontSize: "var(--font-caption)" }}>
          {medicalStaffList.length > 0 ? medicalStaffList[0].department : "Loading..."}
        </p>

        {/* 콜벨 서비스 영역 */}
        <div className="mt-2 rounded-lg overflow-hidden shadow-md flex-1 flex flex-col">
          <div className="flex justify-between items-center bg-white w-full h-[50px] px-4 py-3 rounded-t-lg border-b border-gray-200">
            <h2 className="text-black text-18px font-semibold">요청 사항 목록</h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="\bg-white border border-gray-200 rounded-md py-1 px-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#98B3C8]"
              style={{ fontSize: "var(--font-caption)" }}
            >
              <option value="전체">전체</option>
              <option value="대기 중">대기 중</option>
              <option value="진행 중">진행 중</option>
              <option value="예약됨">예약됨</option>
              <option value="완료됨">완료됨</option>
            </select>
          </div>

          {/* 콜벨 요청 리스트 */}
          <div className="flex flex-col flex-1 px-2 py-2 overflow-y-auto scrollbar-hide bg-white">
            {filteredRequests.length === 0 ? (
              <div className="p-4 text-center text-gray-500" style={{ fontSize: "var(--font-body)" }}>요청 사항이 없습니다</div>
            ) : (
              filteredRequests.map((request) => {
                const name = patientDetails[request.patientId]?.name ?? "알 수 없음"
                const requestTime = formatTime(request.requestTime)
                const acceptTime = request.acceptTime ? formatTime(request.acceptTime) : "대기 중"
                const displayStatus = convertStatus(request.status)
                const isInProgress = request.status === "IN_PROGRESS"
                const isPending = request.status === "PENDING"
                const isScheduled = request.status === "SCHEDULED"

                return (
                  <div key={request.requestId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="p-3">
                      <div className="flex justify-between items-start w-full mb-1">
                        <div className="flex items-center">
                          <span className="font-bold mr-2" style={{ fontSize: "var(--font-body)" }}>{name}</span>
                          {patientDetails[request.patientId] && (
                            <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full" style={{ fontSize: "var(--font-caption)" }}>
                              {formatGender(patientDetails[request.patientId].gender)}{" "}
                              {calculateAge(patientDetails[request.patientId].birthDate)}세
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end text-[11px] text-gray-500">
                          <div className="flex items-center">
                            <span className="mr-1">요청:</span>
                            <span className="font-medium">{requestTime}</span>
                          </div>
                          {request.acceptTime && (
                            <div className="flex items-center">
                              <span className="mr-1">예약:</span>
                              <span className="font-medium">{acceptTime}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-2 line-clamp-2" style={{ fontSize: "var(--font-caption)" }}>{request.requestContent}</p>

                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() =>
                            isPending
                              ? openPendingModal(request)
                              : isInProgress
                                ? handleMarkComplete(request.requestId)
                                : undefined
                          }
                          className={`
                            px-2 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-200
                            ${
                              isPending
                                ? "bg-gray-100 hover:bg-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                : isInProgress
                                  ? "text-blue-600 bg-blue-100 hover:bg-blue-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                  : isScheduled
                                    ? "text-red-600 bg-red-100"
                                    : "text-green-600 bg-green-100"
                            }
                            ${isPending || isInProgress ? "cursor-pointer" : "cursor-default"}
                          `}
                        >
                          {displayStatus}
                        </button>

                        <Button
                          onClick={() => handleChatClick(request.patientId)}
                          variant="chat"
                        >
                          채팅
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 팝업: 대기 중 → 수락/보류 */}
        {isPendingModalOpen && pendingRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
              <button onClick={closeAllModals} className="absolute top-2 right-2 text-black hover:text-gray-400">
                <FiX />
              </button>
              <div className="text-center">
                <p className="text-gray-600 mb-1" style={{ fontSize: "var(--font-body)" }}>{formatTime(pendingRequest.requestTime)}</p>
                <p className="font-bold text-black mb-1" style={{ fontSize: "var(--font-title)" }}>
                  {patientDetails[pendingRequest.patientId]?.name} 환자
                </p>
                <p className="text-gray-600 mb-4" style={{ fontSize: "var(--font-body)" }}>{pendingRequest.requestContent}</p>
                <p className="text-gray-600 mb-4" style={{ fontSize: "var(--font-body)" }}>수락하시겠습니까?</p>
              </div>
              <div className="flex justify-between">
                <button onClick={handleHold} className="px-3 py-2font-medium rounded-lg whitespace-nowrap transition-all duration-200 bg-[#F8F8F8] border border-[#E3E3E3] hover:bg-gray-200" 
                style={{ fontSize: "var(--font-body)" }}
                >
                  보류
                </button>
                <button
                  onClick={() => {
                    handleChatClick(pendingRequest.patientId)
                    closeAllModals()
                  }}
                  className="px-3 py-2 bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 hover:bg-gray-500"
                  style={{ fontSize: "var(--font-body)" }}
                >
                  채팅
                </button>
                <button
                  onClick={handleAccept}
                  className="px-3 py-2 font-medium rounded-lg whitespace-nowrap transition-all duration-200 bg-[#417BB4] border border-[#306292] text-white hover:bg-[#2c5a8c]"
                  style={{ fontSize: "var(--font-body)" }}
                >
                  수락
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 팝업: 예약 시간 선택 */}
        {isScheduleModalOpen && pendingRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
              <button onClick={closeAllModals} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                ✖
              </button>
              <div className="text-center mb-4">
                <p className="font-bold text-black mb-2" style={{ fontSize: "var(--font-title)" }}>예약 시간 설정</p>
                <input
                  type="time"
                  className="border p-1 w-full"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  onClick={closeAllModals}
                  variant="cancel"
                  size='large'
                >
                  취소
                </Button>
                <Button 
                  onClick={() => {handleScheduleConfirm()}}
                  variant="save"
                  size='large'
                >
                  확인
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 매크로, 빠른 답변 화면 전환 */}
      {isMacroMode ? (
        <div className="flex-1 relative w-[79%]">
          <NurseMacroList medicalStaffId={Number(medicalStaffId)} />
        </div>
      ) : isQAMode ? (
        <div className="flex-1 relative w-[79%]">
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
          <div className="w-1/5 flex flex-col space-y-5 h-full">
            <div className="bg-[#DFE6EC] h-3/5 rounded-lg shadow-lg p-6 flex-1 overflow-y-auto">
              {selectedPatient !== null ? (
                <Nurse_DetailedPatientInfo
                  patientId={selectedPatient}
                  onBack={handleBackToList}
                  onChatClick={(id) => handleChatClick(id)}
                />
              ) : (
                <NursePatientInfo onPatientClick={handlePatientClick} />
              )}
            </div>
            <div className="bg-[#DFE6EC] h-2/5 rounded-lg shadow-lg p-6 overflow-y-auto">
              <NurseSchedule />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NurseMainPage
