import React, { useState, useEffect } from 'react';
import logo from "../../assets/carebridge_logo.png";
import bar from "../../assets/hamburger bar.png";

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

const NurseService: React.FC = () => {
  const [requests, setRequests] = useState<CallBellRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [patientDetails, setPatientDetails] = useState<{ [key: number]: PatientDetail }>({});

  const medicalStaffId = 1; // 임시 staffId

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
            statusPriority.indexOf(a.status) - statusPriority.indexOf(b.status)
        )
      : requests.filter((req) => convertStatus(req.status) === selectedStatus);

  return (
    <div className="w-full h-full bg-[#F0F4FA] p-4 border-gray-300 flex flex-col">
      {/* 상단 Select 영역 */}
      <div className="bg-[#98B3C8] w-full h-[40px] pl-20 pr-3 rounded-tl-md rounded-tr-md">
        <select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="w-full border m-1.5 rounded"
        >
          <option value="전체">전체</option>
          <option value="대기">대기</option>
          <option value="진행 중">진행 중</option>
          <option value="예약">예약</option>
          <option value="완료">완료</option>
        </select>
      </div>

      <div className="flex-grow overflow-y-auto mt-4">
      {filteredRequests.map((request) => {
          const displayStatus = convertStatus(request.status);
          return (
            <div key={request.requestId} className="p-4 border border-gray-300 mb-2">
              <div className="flex justify-between">
                <div>
                  {patientDetails[request.patientId] && (
                    <>
                      <div className="flex justify-between">
                        <p className="font-bold">
                          {patientDetails[request.patientId].name}
                        </p>
                        <div className="flex flex-col items-end text-[11px] text-gray-500 pl-10 ml-7 pb-1">
                          <p>요청: {formatTime(request.requestTime)}</p>
                          <p>
                            예약:{" "}
                            {request.acceptTime ? formatTime(request.acceptTime) : "미수락"}
                          </p>
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
                <button className="px-4 py-1 bg-gray-400 text-sm font-semibold rounded">
                  채팅
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NurseService;
