import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import axios from "axios";

// 환자 정보를 담는 인터페이스 정의
interface PatientDto {
  patientId: number;      // 환자 고유 ID
  phoneNumber: string;    // 전화번호
  name: string;          // 환자 이름
  birthDate: string;     // 생년월일
  gender: "Male" | "Female";  // 성별
  guardianContact: string;    // 보호자 연락처
  hospitalId: number;         // 병원 ID
  hospitalLocation: string;   // 병실 위치
  chatRoomId: string;        // 채팅방 ID
  department: string;        // 병동
  email: string;            // 이메일
  hospitalizationDate: string;  // 입원일
  userId: number;           // 사용자 ID
}

// 보호자 정보를 담는 인터페이스 정의
interface GuardianDto {
  guardianId: string;    // 보호자 ID
  name: string;          // 보호자 이름
  patientId: number;     // 환자 ID
  phoneNumber: string;   // 보호자 전화번호
}

const LOADING_MESSAGE = "Loading...";
const DEFAULT_HOSPITAL_NAME = "병원 정보 없음";

// 입원일로부터 현재까지의 일수를 계산하는 함수
const calculateDaysSinceHospitalization = (hospitalizationDate: string): number => {
  const hospitalizationDateObj = new Date(hospitalizationDate);
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - hospitalizationDateObj.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
};

// 날짜 포맷을 변환하는 유틸리티 함수 (YYYY-MM-DD 형식으로 변환)
const formatDate = (date: string): string => date.split("T")[0];

// 환자 설정 페이지 메인 컴포넌트
const PatientSettingPage: React.FC = () => {

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


  // 상태 관리를 위한 useState 훅 정의
  const [patientDto, setPatientDto] = useState<PatientDto | null>(null);
  const [guardianDto, setGuardianDto] = useState<GuardianDto | null>(null);
  const [patientInfo, setPatientInfo] = useState<PatientDto | null>(null);
  const [hospitalName, setHospitalName] = useState<string>("");
  const { patientId } = useUserContext();

  // 병원 이름을 가져오는 API 호출 함수
  const fetchHospitalName = async (hospitalId: number): Promise<string> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/hospital/name/${hospitalId}`);
      return response.data;
    } catch (error) {
      console.error("병원 정보 조회 중 오류 발생:", error);
      return DEFAULT_HOSPITAL_NAME;
    }
  };

  // 보호자 정보를 가져오는 API 호출 함수
  const fetchGuardianInfo = async (guardianContact: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/guardian/info/${guardianContact}`);
      return response.data;
    } catch (error) {
      console.error("보호자 정보 조회 중 오류 발생:", error);
      return null;
    }
  };

  // 환자와 보호자 정보를 함께 가져오는 통합 API 호출 함수
  const fetchPatientAndGuardianInfo = async () => {
    if (!patientId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/patient/user/${patientId}`);
      const patientData = response.data;
      
      patientData.birthDate = formatDate(patientData.birthDate);
      patientData.hospitalizationDate = formatDate(patientData.hospitalizationDate);
      
      setPatientDto(patientData);

      const hospitalName = await fetchHospitalName(patientData.hospitalId);
      setHospitalName(hospitalName);

      if (patientData.guardianContact) {
        const guardianData = await fetchGuardianInfo(patientData.guardianContact);
        setGuardianDto(guardianData);
      }
    } catch (error) {
      console.error("환자 정보 조회 중 오류 발생:", error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    fetchPatientAndGuardianInfo();
  }, [patientId]);

  // useEffect(() => {
  //   const dummyPatient: PatientDto = {
  //     patientId: 1,
  //     phoneNumber: "01012345678",
  //     name: "홍길동",
  //     birthDate: "1990-05-01",
  //     gender: "Male",
  //     guardianContact: "01098765432",
  //     hospitalId: 101,
  //     hospitalLocation: "301호",
  //     chatRoomId: "room123",
  //     department: "내과",
  //     email: "hong@test.com",
  //     hospitalizationDate: "2024-04-20",
  //     userId: 1,
  //   };
  
  //   const dummyGuardian: GuardianDto = {
  //     guardianId: "g1",
  //     name: "김보호자",
  //     patientId: 1,
  //     phoneNumber: "01098765432"
  //   };
  
  //   setPatientDto(dummyPatient);
  //   setGuardianDto(dummyGuardian);
  //   setHospitalName("서울대학교병원");
  // }, []);

  // 로딩 중일 때 표시할 화면
  if (!patientDto) {
    return <div>{LOADING_MESSAGE}</div>;
  }

  // 메인 렌더링 부분
  return (
    <div className="flex flex-col min-h-screen bg-white p-4">
      {/* 헤더 섹션 - 뒤로가기 버튼과 '설정' 타이틀 */}
      <div className="relative flex items-center p-2 w-full mb-8">
        <Link
          to="/patient-main"
          className="absolute left-2 top-1/2 transform -translate-y-1/2"
        >
          <img src="/src/assets/back.png" alt="뒤로가기" className="w-[7vw]" />
        </Link>
        <div className="flex-grow flex items-center justify-center">
          <p className="font-bold text-black text-[18px]">
            설정
          </p>
        </div>
      </div>

      {/* 메인 컨테이너 - 보호자&환자 정보 카드 */}
      <div className="flex flex-col items-center p-0 w-full max-w-md h-auto bg-white border-2 border-[#e6e6e6] rounded-[30px] shadow-lg mx-auto opacity-100">
        {/* 보호자 기본 정보 섹션 */}
        <div className="flex flex-col w-full">
          <div className="flex-1 border-b border-gray-300 p-7 m-0 flex items-center">
            <div className="flex flex-col justify-center items-start space-y-0 w-full gap-2">
              <p className="text-black text-[15px]">
                보호자
              </p>
              <p className="text-black font-bold whitespace-nowrap text-[25px]">
                {guardianDto?.name || ""} 님, 안녕하세요.
              </p>
              <div className="border border-[#226193] rounded-[60px] px-2 py-1">
                <p
                  className="text-[#226193] font-normal mt-[-4px]"
                  style={{ fontSize: "3.5vw" }}
                >
                  환자: {patientDto?.name || "미등록"}
                </p>
              </div>
              <div className="border border-[#226193] rounded-[60px] px-2 py-1">
                <p
                  className="text-[#226193] font-normal mt-[-4px]"
                  style={{ fontSize: "3.5vw" }}
                >
                  입원일: {new Date(patientDto.hospitalizationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="border border-[#226193] rounded-[60px] px-2 py-1">
                <p
                  className="text-[#226193] font-normal mt-[-4px]"
                  style={{ fontSize: "3.5vw" }}
                >
                  재원 일수: {calculateDaysSinceHospitalization(patientDto.hospitalizationDate)}일째
                </p>
              </div>
            </div>
          </div>

          {/* 상세 환자 정보 섹션 */}
          <div className="flex-1 border-b border-gray-300 p-6 m-0 flex items-center">
            <div className="w-full">
              <p
                className="text-[#747474] font-normal"
                style={{ fontSize: "4.5vw" }}
              >
                환자 정보
              </p>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div className="flex flex-col justify-center items-start space-y-2">
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    이름
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    성별
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    생년월일
                  </p>
                </div>
                <div className="flex flex-col justify-center items-end space-y-2 col-span-3 ml-auto">
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {patientDto.name}
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {patientDto.gender}
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {patientDto.birthDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 입원 정보 섹션 */}
          <div className="flex-1 border-b border-gray-300 p-6 m-0 flex items-center">
            <div className="w-full">
              <p
                className="text-[#747474] font-normal"
                style={{ fontSize: "4.5vw" }}
              >
                입원 정보
              </p>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div className="flex flex-col justify-center items-start space-y-2">
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    병원
                  </p>
                  <p className="text-black font-normal whitespace-nowrap" style={{ fontSize: "4vw" }}>
                    병동/호실
                  </p>
                </div>
                <div className="flex flex-col justify-center items-end space-y-2 col-span-3 ml-auto">
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {hospitalName}
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {patientDto.department} / {patientDto.hospitalLocation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 계정 설정 섹션 */}
          <div className="flex-1 border-b border-gray-300 p-6 m-0 flex items-center">
            <div className="w-full">
              <p
                className="text-[#747474] font-normal"
                style={{ fontSize: "4.5vw" }}
              >
                계정 설정
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <Link
                  to="/change-phonenum"
                  className="text-black font-normal flex justify-between items-center"
                  style={{ fontSize: "4vw" }}
                >
                  전화번호 수정 <span>&gt;</span>
                </Link>
                <Link
                  to="/push-notifications"
                  className="text-black font-normal flex justify-between items-center"
                  style={{ fontSize: "4vw" }}
                >
                  푸시알림 <span>&gt;</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 기타 설정 섹션 */}
          <div className="flex-1 p-7 m-0 flex items-center">
            <div className="w-full">
              <p
                className="text-[#747474] font-normal"
                style={{ fontSize: "4.5vw" }}
              >
                기타
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <Link
                  to="/customer-service"
                  className="text-black font-normal flex justify-between items-center"
                  style={{ fontSize: "4vw" }}
                >
                  고객센터 <span>&gt;</span>
                </Link>
                <Link
                  to="/app-info"
                  className="text-black font-normal flex justify-between items-center"
                  style={{ fontSize: "4vw" }}
                >
                  앱 정보 <span>&gt;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSettingPage;