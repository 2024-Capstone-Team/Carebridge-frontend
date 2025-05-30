import { useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import NurseCalendar from "../../components/nurse/NurseCalendar"
import ScheduleEditForm from "../../components/nurse/NurseScheduleEdit"
import ScheduleAdd from "../../components/nurse/NurseScheduleAdd"
import logo from "../../assets/carebridge_logo.png"
import { FiMenu, FiChevronsDown, FiHome, FiCalendar, FiCpu, FiUser } from "react-icons/fi"
import { BsStopwatch } from "react-icons/bs"
import { FaPlus } from "react-icons/fa"
import axios from "axios"
import type { MedicalStaff } from "../../types"
import { useUserContext } from "../../context/UserContext"
import { formatBirthdate } from "../../utils/commonUtils"

interface Patient {
  patientId: number
  name: string
  birthDate: string
}

const NurseSchedulePage: React.FC = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [modeCalendar, setModeCalendar] = useState(true)
  const [modeEdit, setModeEdit] = useState(false)
  const [modeAdd, setModeAdd] = useState(false)
  const { scheduleId } = useParams<{ scheduleId: string }>()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [hospitalName, setHospitalName] = useState("") // 불러올 병원 이름
  const [medicalStaffList, setMedicalStaffList] = useState<MedicalStaff[]>([]) // 분과 이름
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const { hospitalId } = useUserContext()
  const staffId = 1

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

  // 현재 시각 표시
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

  // 환자 데이터 API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/patient/users/${staffId}`)
        console.log(response.data) // 응답 데이터 확인
        const fetchedPatients = response.data.map((patient: any) => ({
          patientId: patient.patientId,
          name: patient.name,
          birthDate: patient.birthDate,
        }))

        // 이름 기준으로 환자 정렬
        fetchedPatients.sort((a: Patient, b: Patient) => a.name.localeCompare(b.name, "ko", { sensitivity: "base" }))
        setPatients(fetchedPatients)
        setLoading(false)
      } catch (error) {
        console.error("환자 데이터를 가져오는 중 오류 발생:", error)
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const handleLogoClick = () => {
    navigate("/nurse-main")
  }

  const handleMenuClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left })
    setIsDropdownVisible((prev) => !prev)
  }

  // 스케줄 수정 시 호출
  const handleEditSchedule = (scheduleId: string) => {
    setEditingScheduleId(scheduleId) // 수정할 스케줄 ID 저장
    setModeCalendar(false)
    setModeAdd(false)
    setModeEdit(true)
  }

  // 스케줄 추가 버튼 클릭 시 호출
  const handleAddSchedule = () => {
    setModeCalendar(false)
    setModeEdit(false)
    setModeAdd(true)
  }

  // 취소 버튼 클릭 시 호출
  const handleCancel = () => {
    setModeCalendar(true)
    setModeEdit(false)
    setModeAdd(false)
    setEditingScheduleId(null) // 수정 상태 초기화
  }

  const handleMacroClick = () => {
    navigate("/nurse-main", { state: { macroMode: true } })
  }

  const handleQAClick = () => {
    navigate("/nurse-main", { state: { QAMode: true } })
  }

  const handleMenuMoveClick = (path: string) => {
    if (path === "/nurse-schedule") {
      setModeCalendar(true)
      setModeEdit(false)
      setModeAdd(false)
    }
    navigate(path)
  }

  // view 값에 따라 초기 모드 설정
  useEffect(() => {
    if (location.state?.view === "edit" && location.state.scheduleId) {
      setModeCalendar(false)
      setModeEdit(true)
      setModeAdd(false)
      setEditingScheduleId(location.state.scheduleId)
    } else if (location.state?.view === "add") {
      setModeCalendar(false)
      setModeEdit(false)
      setModeAdd(true)
    } else {
      setModeCalendar(true)
      setModeEdit(false)
      setModeAdd(false)
    }
  }, [location])

  // 환자 검색 필터링
  const filteredPatients = patients

  // 환자 선택 처리
  const handlePatientClick = (patientId: number) => {
    setSelectedPatient(patientId === selectedPatient ? null : patientId)
  }

  return (
    /* 전체 창*/
    <div className="flex h-screen bg-gray-100 p-6">

      {/* 왼쪽 사이드바 영역 */}
      <div className="h-full w-1/5 mr-4 overflow-hidden flex flex-col">

        {/* 메뉴바 + 로고 영역 */}
        <div className="bg-[#F0F4FA] rounded-lg p-6 mb-4 h-full flex flex-col">
          <div className="flex items-center mb-4" style={{ marginTop: "-60px" }}>
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
        <div className="flex text-center text-[16px] text-gray-600 mb-4" style={{ marginTop: "-40px" }}>
          <p className="text-black font-semibold mr-2">{formattedDate}</p>
          <p className="text-gray-600">{formattedTime}</p>
        </div>

        {/* 병원 정보 표시 영역 */}
        <p className="text-black text-[16px] font-semibold">{hospitalName ? hospitalName : "Loading..."}</p>
        <p className="text-gray-600 " style={{ fontSize: "var(--font-caption)" }}>
          {medicalStaffList.length > 0 ? medicalStaffList[0].department : "Loading..."}
        </p>

          {/* 환자 목록 영역 */}
          <div className="bg-white rounded-lg shadow-sm flex-grow mt-4 flex flex-col overflow-hidden scrollbar-hide">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-gray-800 text-18px font-semibold">환자 목록</h2>
                <button className="bg-transparent p-2  hover:text-gray-400" onClick={handleAddSchedule}>
                  <FaPlus />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto px-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="w-10 h-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">환자 정보를 불러오는 중...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FiUser className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">등록된 환자가 없습니다</p>
                </div>
              ) : (
                <ul className="py-3 space-y-2.5">
                  {filteredPatients.map((patient) => {
                    const isSelected = patient.patientId === selectedPatient

                    return (
                      <li
                        key={patient.patientId}
                        className={`p-3 rounded-lg ${
                          isSelected
                            ? "bg-gray-50 border-gray-300 border"
                            : "bg-white border-b border-gray-100 hover:bg-gray-50"
                        } cursor-pointer transition-all duration-200`}
                        onClick={() => handlePatientClick(patient.patientId)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold stext-gray-800" style={{ fontSize: "var(--font-body)" }}>{patient.name}</span>
                          <span className="text-xs text-gray-500">{formatBirthdate(patient.birthDate)}</span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 캘린더 영역 */}
      <div className="flex-1 bg-[#DFE6EC] rounded-lg shadow-md h-full overflow-hidden">
        <div className="h-full p-4 overflow-y-auto">
          {modeCalendar && <NurseCalendar onEdit={handleEditSchedule} />}
          {modeEdit && editingScheduleId && (
            <ScheduleEditForm scheduleId={Number(editingScheduleId)} onCancel={handleCancel} />
          )}
          {modeAdd && <ScheduleAdd patients={patients} medicalStaffId={staffId} onCancel={handleCancel} />}
        </div>
      </div>
    </div>
  )
}

export default NurseSchedulePage
