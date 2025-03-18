import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaSearch } from "react-icons/fa";
import Fuse from "fuse.js";
import axios from "axios";

interface PatientInfo {
  patientId: number;
  name: string;
  birthDate: string;
  gender: string;
  hospitalizationDate: string;
  diagnosis: string;
  hospitalLocation: string;
  phoneNumber: string;
}

interface RequestRecord {
  requestId: number;
  patientId: number;
  medicalStaffId: number;
  requestContent: string;
  status: string;
  requestTime: string;
  acceptTime: string;
}

interface NurseDetailedPatientInfoProps {
  patientId: number; // 선택된 환자의 ID
  onBack: () => void; // 돌아가기 버튼 핸들러
  onChatClick: (patientId: number) => void; // 채팅 버튼 클릭 시 호출
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "정보 없음";
  const isoDate = new Date(date);
  const year = isoDate.getFullYear();
  const month = String(isoDate.getMonth() + 1).padStart(2, "0");
  const day = String(isoDate.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
};

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

const NurseDetailedPatientInfo: React.FC<NurseDetailedPatientInfoProps> = ({ patientId, onBack, onChatClick }) => {
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allPatients, setAllPatients] = useState<PatientInfo[]>([]);
  const [patientRequests, setPatientRequests] = useState<RequestRecord[]>([]);

  // 선택한 환자의 상세 정보 가져오기
  useEffect(() => {
    if (!patientId) {
      console.warn("유효하지 않은 환자 ID:", patientId);
      return;
    }
    const fetchPatientDetails = async () => {
      try {
        // 기본 환자 정보 조회
        const response = await axios.get(`http://localhost:8080/api/patient/user/${patientId}`);
        const fetchedPatient: PatientInfo = response.data;
  
        // 병명 조회
        try {
          const diseaseResponse = await axios.get(`http://localhost:8080/api/medical-record/${patientId}`);
          const diseaseInfo: string | null = diseaseResponse.data;
          fetchedPatient.diagnosis = diseaseInfo || "정보 없음";
        } catch (error) {
          console.error("질병 정보 조회 중 오류 발생:", error);
          fetchedPatient.diagnosis = "정보 없음";
        }
  
        // 환자 데이터를 상태에 저장
        setPatient(fetchedPatient);
      } catch (error) {
        console.error("환자 세부 정보를 가져오는 중 오류 발생:", error);
        setPatient({
          patientId,
          name: "정보 없음",
          birthDate: "",
          gender: "",
          hospitalizationDate: "",
          diagnosis: "정보 없음",
          hospitalLocation: "정보 없음",
          phoneNumber: "정보 없음",
        });
      }
    };
    fetchPatientDetails();
  }, [patientId]);
  

  // 선택한 환자의 요청 기록 가져오기
  useEffect(() => {
    if (!patientId) return;
    const fetchPatientRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/call-bell/request/patient/${patientId}`);
        console.log("환자 요청 기록:", response.data);
        
        // 요청 기록 최신순 정렬
        const sortedRequests = response.data.sort(
          (a: RequestRecord, b: RequestRecord) =>
            new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime()
        );
        setPatientRequests(sortedRequests);
      } catch (error) {
        console.error("환자의 요청 기록을 가져오는 중 오류 발생:", error);
      }
    };
    fetchPatientRequests();
  }, [patientId]);

  // 전체 환자 목록 가져오기 (검색용)
  useEffect(() => {
    const fetchAllPatients = async () => {
      try {
        const staffId = 1; // 임시 staff_id 값
        const response = await axios.get(`http://localhost:8080/api/patient/users/${staffId}`);
        const fetchedPatients = response.data.map((p: any) => ({
          patientId: p.patientId,
          name: p.name,
          birthDate: p.birthDate,
          gender: p.gender,
          hospitalizationDate: p.hospitalizationDate,
          diagnosis: p.diagnosis,
          hospitalLocation: p.hospitalLocation,
          phoneNumber: p.phoneNumber,
        }));
        fetchedPatients.sort((a: PatientInfo, b: PatientInfo) =>
          a.name.localeCompare(b.name, "ko", { sensitivity: "base" })
        );
        setAllPatients(fetchedPatients);
      } catch (error) {
        console.error("환자 데이터를 가져오는 중 에러 발생:", error);
      }
    };
    fetchAllPatients();
  }, []);

  const fuse = new Fuse(allPatients, {
    keys: ["name"],
    threshold: 0.3,
  });

  const filteredPatients = searchQuery ? fuse.search(searchQuery).map(result => result.item) : [];

  return (
    <div className="h-full bg-[#DFE6EC] p-3 rounded-lg">
      <div className="flex relative mb-4">
        <FaChevronLeft className="w-[20px] h-[20px] mr-2 cursor-pointer hover:text-gray-400 absolute -translate-x-6 translate-y-1" onClick={onBack}/>
        <h2 className="text-lg font-bold">환자 정보</h2>
      </div>

      {/* 검색 결과 목록 */}
      {searchQuery ? (
        <div className="space-y-4 h-[350px] overflow-y-auto scrollbar-hide">
          {filteredPatients.length > 0 ? (
            <ul className="space-y-4 w-full cursor-pointer">
              {filteredPatients.map((p) => (
                <li
                  key={p.patientId}
                  className="pb-2"
                  onClick={() => {
                    setSearchQuery("");
                    navigate(`/nurse/patient/${p.patientId}`);
                  }}
                >
                  <div className="text-base font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-600">
                    <span>
                      {formatDate(p.birthDate)} {p.gender === "Male" ? "남" : "여"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
          )}
        </div>
      ) : (
        // 검색어가 없으면 상세 정보와 요청 기록 표시
        <>
          {!patient ? (
            <div className="text-gray-500 text-center">로딩 중...</div>
          ) : (
            <div className="overflow-y-auto h-[350px] scrollbar-hide">
              <div className="mb-1">
                <h2 className="text-lg font-semibold">{patient.name}</h2>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>생년월일</p>
                  <p>{formatDate(patient.birthDate)}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>성별</p>
                  <p>{patient.gender === "Male" ? "남" : "여"}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>입원일</p>
                  <p>{formatDate(patient.hospitalizationDate)}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>병명</p>
                  <p>{patient.diagnosis || "정보 없음"}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>위치</p>
                  <p>{patient.hospitalLocation || "정보 없음"}</p>
                </div>
                <div className="flex justify-between text-gray-500 my-1">
                  <p>전화번호</p>
                  <p>{patient.phoneNumber || "정보 없음"}</p>
                </div>
                <div className="flex justify-end mt-1">
                  <button 
                    className="bg-gray-300 border-gray-400 rounded-md border text-center px-2 w-[50px] hover:bg-gray-400"
                    onClick={() => onChatClick(patient.patientId)}
                  >
                    채팅
                  </button>
                </div>
              </div>

              {/* 요청 기록 영역 */}
              <h3 className="text-[15px] font-semibold mt-2 mb-1">요청 기록</h3>
              {patientRequests.length === 0 ? (
                <p className="text-gray-500">요청 기록이 없습니다.</p>
              ) : (
                <ul className="text-[15px] text-gray-500">
                  {patientRequests.map((req, index) => {
                    const formattedDate = formatDate(req.requestTime);
                    const showDate =
                      index === 0 ||
                      formattedDate !== formatDate(patientRequests[index - 1].requestTime);
                    return (
                      <li key={req.requestId} className="mb-5">
                        {showDate && <p className="mb-2">{formattedDate}</p>}
                        <p className="text-[13px]">요청 시간: {formatTime(req.requestTime)}</p>
                        <p className="text-[13px]">완료 시간: {req.acceptTime ? formatTime(req.acceptTime) : "대기 중"}</p>
                        <p className="text-[13px]">{req.requestContent}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NurseDetailedPatientInfo;
