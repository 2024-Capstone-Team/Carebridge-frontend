import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import NurseSchedule from "../../components/nurse/NurseSchedule";
import NursePatientInfo from "../../components/nurse/NursePatientInfo";
import Nurse_DetailedPatientInfo from '../../components/nurse/NurseDetailedPatientInfo';
import NurseMacroList from '../../components/nurse/NurseMacroList';
import NurseQuickAnswerList from '../../components/nurse/NurseQuickAnswerList';
import NurseMessaging from '../../components/nurse/NurseMessaging';
import { CallBellRequest, PatientDetail, ChatConversation, MedicalStaff } from '../../types';
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";
import home from "../../assets/home.png";
import schedular from "../../assets/schedular.png";
import dbarrows from "../../assets/double arrows.png";
import dwarrows from "../../assets/down arrows.png";
import qresponse from "../../assets/quick response.png";
import macro from "../../assets/macro.png";
import axios from "axios";

const NurseMainPage: React.FC = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isMacroMode, setIsMacroMode] = useState(false); // 매크로 설정 화면 여부
  const [isQAMode, setIsQAMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null); // 환자 정보 선택 상태
  const [hospitalName, setHospitalName] = useState(""); // 불러올 병원 이름
  const [medicalStaffList, setMedicalStaffList] = useState<MedicalStaff[]>([]); // 분과 이름
  const [requests, setRequests] = useState<CallBellRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [patientDetails, setPatientDetails] = useState<{ [key: number]: PatientDetail }>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chatConversation, setChatConversation] = useState<ChatConversation | null>(null); // 채팅창을 열기 위한 상태

  const navigate = useNavigate();
  const location = useLocation();

  const medicalStaffId = 1; // 임시 staffId
  const hospitalId = 1; // 임시 병원 Id

  // 병원 이름 API 호출
  useEffect(() => {
    axios.get(`http://localhost:8080/api/hospital/name/${hospitalId}`)
      .then(response => setHospitalName(response.data))
      .catch(error => {
        console.error("Error fetching hospital name:", error);
        setHospitalName("병원 정보를 불러오지 못했습니다.");
      });
  }, [hospitalId]);

  const handleLogoClick = () => {
    setIsMacroMode(false);
    setIsQAMode(false);
    navigate('/nurse-main');
  };

  // 분과 API
  useEffect(() => {
    const fetchMedicalStaff = async () => {
      try {
        const response = await axios.get<MedicalStaff[]>(`http://localhost:8080/api/medical-staff/${hospitalId}`);
        setMedicalStaffList(response.data);
      } catch (error){
        console.error("의료진 분과 데이터를 가져오는 중 오류 발생:", error);
      }
    };
    fetchMedicalStaff();
  }, [hospitalId]);


  const handleHamburgerClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setIsDropdownVisible(prev => !prev);
  };

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

  const handleMenuClick = (path: string) => {
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

  // 채팅 버튼 클릭 시 해당 환자 정보 이용
  const handleChatClick = (patientId: number) => {
    console.log("채팅 버튼 클릭: 환자 ID", patientId);
    const patientDetail = patientDetails[patientId];
    const patientName = patientDetail ? patientDetail.name : "Unknown";
    
    // 채팅 버튼 
    const conversationId = `${medicalStaffId}_${patientId}`;
    setChatConversation({ conversationId, patientId, patientName });
  };

  const convertStatus = (status: string): string => {
    if (status === "PENDING") return "대기 중";
    if (status === "COMPLETED") return "완료됨";
    if (status === "IN_PROGRESS") return "진행 중";
    if (status === "SCHEDULED") return "예약됨";
    return status;
  };

  const calculateAge = (birthDateString: string): number | string => {
    if (!birthDateString) return "정보 없음";
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return "정보 없음";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const isBeforeBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
    if (isBeforeBirthday) age--;
    return age;
  };

  const formatBirthdate = (birthdate: string | null | undefined) => {
    if (!birthdate) return "정보 없음";
    try {
      const trimmedDate = birthdate.split("T")[0];
      const [year, month, day] = trimmedDate.split("-");
      return year && month && day ? `${year}.${month}.${day}` : "정보 없음";
    } catch (error) {
      console.error("formatBirthdate 처리 중 에러:", error);
      return "정보 없음";
    }
  };

  const formatGender = (gender: string): string => {
    return gender === "Male" ? "남" : gender === "Female" ? "여" : "정보 없음";
  };

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return "정보 없음";
    try {
      const dateObj = new Date(timeString);
      if (isNaN(dateObj.getTime())) return "정보 없음";
      return dateObj.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
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
    const uniquePatientIds = Array.from(new Set(requests.map(req => req.patientId)));
    uniquePatientIds.forEach(patientId => {
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
      setPatientDetails(prev => ({ ...prev, [patientId]: data }));
    } catch (error) {
      console.error(`환자 상세 정보 가져오기 실패 (ID: ${patientId})`, error);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const statusPriority = ['대기 중', '진행 중', '예약됨', '완료됨'];
  const filteredRequests =
    selectedStatus === "전체"
      ? [...requests].sort((a, b) =>
          statusPriority.indexOf(convertStatus(a.status)) - statusPriority.indexOf(convertStatus(b.status))
        )
      : requests.filter(req => convertStatus(req.status) === selectedStatus);

  return (
    /* 전체 창*/
    <div className="flex h-screen bg-gray-100 p-6">
      {/* 메뉴 영역 */}
      <div className="h-full w-1/5 p-6 mr-4 rounded-lg overflow-hidden bg-[#F0F4FA]">
        <div className="flex items-center mb-4" style={{ marginTop: '-60px' }}>
          <img src={isDropdownVisible ? dwarrows : bar} alt="hamburger bar"
               className="relative w-[1.7em] h-[1.7em] mr-2 cursor-pointer"
               onClick={handleHamburgerClick} />
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
                    onClick={() => handleMenuClick("/nurse-main")}>
                  <img src={home} alt="home" className="w-4 h-4 mr-2" />메인 화면
                </li>
                <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleMenuClick("/nurse-schedule")}>
                  <img src={schedular} alt="schedular" className="w-4 h-4 mr-2" />스케줄러
                </li>
                <li className="px-2 py-1 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={handleMacroClick}>
                  <img src={macro} alt="macro" className="w-4 h-4 mr-2" />매크로 설정
                </li>
                <li className="px-2 pt-1 pb-2 text-[13px] font-semibold hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={handleQAClick}>
                  <img src={qresponse} alt="qresponse" className="w-4 h-4 mr-2" />빠른 답변 설정
                </li>
                <hr className="bg-gray-600" />
                <li className="px-2 pt-2 pb-1 text-[13px] text-gray-500 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleMenuClick("/nurse-reset-password")}>비밀번호 재설정</li>
                <li className="px-2 py-1 text-[13px] text-gray-500 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleMenuClick("/nurse-login")}>로그아웃</li>
              </ul>
            </div>
          )}
          <img src={logo} alt="CareBridge 로고" className="w-[7.5em] h-[7.5em] cursor-pointer" onClick={handleLogoClick} />
        </div>

        <div className="flex text-center text-gray-600 mb-4" style={{ marginTop: '-40px' }}>
          <p className="text-black font-semibold mr-2">{formattedDate}</p>
          <p className="text-gray-600 font-[12px]">{formattedTime}</p>
        </div>

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

      {isMacroMode ? (
        <div className="flex-1 relative w-full">
          <NurseMacroList medicalStaffId={medicalStaffId} />
        </div>
      ) : isQAMode ? (
        <div className="flex-1 relative w-full">
          <NurseQuickAnswerList hospitalId={hospitalId} />
        </div>
      ) : (
        <>
          <NurseMessaging 
            selectedConversation={chatConversation}
            onCloseChat={() => setChatConversation(null)}
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
