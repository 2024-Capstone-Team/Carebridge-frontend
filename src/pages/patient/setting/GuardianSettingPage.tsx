/**
 * 보호자 설정 페이지
 * 보호자의 정보, 담당 환자 정보, 계정 설정 등을 관리하는 페이지입니다.
 */

// 필요한 외부 모듈 및 컴포넌트 임포트
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../../../context/UserContext";

// 보호자 정보 타입 정의
interface GuardianDto {
  guardianId: string;      // 보호자 고유 식별자
  name: string;            // 보호자 이름
  patientId: number;       // 담당 환자 ID
  phoneNumber: string;     // 보호자 전화번호
}

// 환자 정보 타입 정의
interface PatientDto {
  patientId: number;           // 환자 고유 식별자
  phoneNumber: string;         // 환자 전화번호
  name: string;               // 환자 이름
  birthDate: string;          // 생년월일
  gender: "Male" | "Female";  // 성별
  guardianContact: string;    // 보호자 연락처
  hospitalId: number;         // 병원 ID
  hospitalLocation: string;   // 병실 위치
  chatRoomId: string;        // 채팅방 ID
  department: string;         // 병동 정보
  email: string;             // 이메일 주소
  hospitalizationDate: string; // 입원일
  userId: number;            // 사용자 ID
}

// 공통으로 사용되는 상수 정의
const LOADING_MESSAGE = "Loading...";              // 로딩 시 표시될 메시지
const DEFAULT_HOSPITAL_NAME = "병원 정보 없음";    // 병원 정보가 없을 때 표시될 기본값

/**
 * 입원일로부터 현재까지의 일수를 계산하는 함수
 * @param hospitalizationDate 입원일자 (문자열)
 * @returns 입원 일수
 */
const calculateDaysSinceHospitalization = (hospitalizationDate: string): number => {
  const hospitalizationDateObj = new Date(hospitalizationDate);
  const currentDate = new Date();
  return Math.floor((currentDate.getTime() - hospitalizationDateObj.getTime()) / (1000 * 3600 * 24));
};

/**
 * 날짜 문자열을 YYYY-MM-DD 형식으로 변환하는 함수
 * @param date ISO 형식의 날짜 문자열
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
const formatDate = (date: string): string => date.split("T")[0];

/**
 * 보호자 설정 페이지 메인 컴포넌트
 */
const GuardianSettingPage: React.FC = () => {
  // 상태 관리
  const [guardianPhoneNumber, setGuardianPhoneNumber] = useState<string | null>(null);  // 보호자 전화번호 상태
  const [guardianInfo, setGuardianInfo] = useState<GuardianDto | null>(null);          // 보호자 정보 상태
  const [patientInfo, setPatientInfo] = useState<PatientDto | null>(null);             // 환자 정보 상태
  const [hospitalName, setHospitalName] = useState<string>("");                         // 병원 이름 상태
  const userId = useUserContext().userId;                                               // 현재 로그인한 사용자 ID

  /**
   * 보호자 전화번호를 조회하는 함수
   * 사용자 ID를 기반으로 보호자의 전화번호를 서버에서 조회합니다.
   */
  const fetchGuardianPhoneNumber = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/guardian/phone/${userId}`);
      setGuardianPhoneNumber(response.data);
    } catch (error) {
      console.error("보호자 전화번호 조회 중 오류 발생:", error);
    }
  };

  /**
   * 병원 이름을 조회하는 함수
   * @param hospitalId 병원 ID
   * @returns 병원 이름
   */
  const fetchHospitalName = async (hospitalId: number): Promise<string> => {
    try {
      const response = await axios.get(`http://localhost:8080/api/hospital/name/${hospitalId}`);
      return response.data;
    } catch (error) {
      console.error("병원 정보 조회 중 오류 발생:", error);
      return DEFAULT_HOSPITAL_NAME;
    }
  };

  /**
   * 보호자와 환자 정보를 조회하는 함수
   * 보호자 전화번호를 기반으로 보호자와 환자의 상세 정보를 조회합니다.
   */
  const fetchGuardianAndPatientInfo = async () => {
    try {
      // 보호자 정보 조회
      const guardianResponse = await axios.get(`http://localhost:8080/api/guardian/info/${guardianPhoneNumber}`);
      const guardianData = guardianResponse.data;
      setGuardianInfo(guardianData);

      // 환자 정보 조회
      const patientResponse = await axios.get(`http://localhost:8080/api/patient/user/${guardianData.patientId}`);
      const patientData = patientResponse.data;
      
      // 날짜 형식 변환
      patientData.birthDate = formatDate(patientData.birthDate);
      patientData.hospitalizationDate = formatDate(patientData.hospitalizationDate);
      
      setPatientInfo(patientData);

      // 병원 이름 조회
      const hospitalName = await fetchHospitalName(patientData.hospitalId);
      setHospitalName(hospitalName);
    } catch (error) {
      console.error("보호자 또는 환자 정보 조회 중 오류 발생:", error);
    }
  };

  // 컴포넌트 마운트 시 보호자 전화번호 조회
  useEffect(() => {
    if(userId) {
      fetchGuardianPhoneNumber();
    }
  }, [userId]);

  // 보호자 전화번호가 있을 때 관련 정보 조회
  useEffect(() => {
    if(guardianPhoneNumber) {
      fetchGuardianAndPatientInfo();
    }
  }, [guardianPhoneNumber]);

  // 데이터 로딩 중일 때 로딩 화면 표시
  if (!guardianInfo || !patientInfo) {
    return <div>{LOADING_MESSAGE}</div>;
  }

  /**
   * 헤더 섹션 컴포넌트
   * 뒤로가기 버튼과 페이지 제목을 포함
   */
  const HeaderSection = () => (
    <div className="relative flex items-center p-2 w-full mb-8">
      <Link
        to="/guardian-main"
        className="absolute left-2 top-1/2 transform -translate-y-1/2"
      >
        <img src="/src/assets/back.png" alt="뒤로가기" className="w-[7vw]" />
      </Link>
      <div className="flex-grow flex items-center justify-center">
        <p className="font-bold text-black" style={{ fontSize: "5vw" }}>
          설정
        </p>
      </div>
    </div>
  );

  /**
   * 보호자 정보 섹션 컴포넌트
   * 보호자 이름과 담당 환자 정보를 표시
   */
  const GuardianInfoSection = () => (
    <div className="flex-1 border-b border-gray-300 p-7 m-0 flex items-center">
      <div className="flex flex-col justify-center items-start space-y-0 w-full">
        <p className="text-black" style={{ fontSize: "5vw" }}>보호자</p>
        <p className="text-black font-bold" style={{ fontSize: "8vw" }}>
          {guardianInfo.name}님, 안녕하세요.
        </p>
        <div className="border border-[#226193] rounded-[60px] p-1">
          <p className="text-[#226193] font-normal mt-[-4px]" style={{ fontSize: "3.5vw" }}>
            연결된 환자: {patientInfo.name}
          </p>
        </div>
      </div>
    </div>
  );

  // 메인 UI 렌더링
  return (
    <div className="flex flex-col min-h-screen bg-white p-4">
      <HeaderSection />
      {/* 메인 컨테이너 */}
      <div className="flex flex-col items-center p-0 w-full max-w-md h-auto bg-white border-2 border-[#e6e6e6] rounded-[30px] shadow-lg mx-auto opacity-100">
        <div className="flex flex-col w-full">
          <GuardianInfoSection />
          
          {/* 환자 정보 섹션 */}
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
                    입원일
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    재원일수
                  </p>
                </div>
                <div className="flex flex-col justify-center items-end space-y-2 col-span-3 ml-auto">
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {patientInfo.name}
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {formatDate(patientInfo.hospitalizationDate)}
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {calculateDaysSinceHospitalization(patientInfo.hospitalizationDate)}일
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
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    병동/호실
                  </p>
                </div>
                <div className="flex flex-col justify-center items-end space-y-2 col-span-3 ml-auto">
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {hospitalName}
                  </p>
                  <p className="text-black font-normal" style={{ fontSize: "4vw" }}>
                    {patientInfo.department} / {patientInfo.hospitalLocation}
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

export default GuardianSettingPage;