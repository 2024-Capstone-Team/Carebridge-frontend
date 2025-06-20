import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as Separator from "@radix-ui/react-separator";
import { useUserContext } from "../../context/UserContext";
import { MedicalStaff } from "../../types";

// 환자 정보를 담는 인터페이스 정의
interface PatientDto {
  patientId: number;      // 환자 고유 IDn
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

const PatientMainPage: React.FC = () => {

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();
  const [patientDto, setPatientDto] = useState<PatientDto | null>(null);
  // const { setPatientId, isPatient } = useUserContext();
  const [hospitalName, setHospitalName] = useState(""); // 불러올 병원 이름
  const [medicalStaffList, setMedicalStaffList] = useState<MedicalStaff[]>([]); // 분과 이름
  const [nextSchedule, setNextSchedule] = useState<any | null>(null); // 가장 빠른 일정

  const phoneNumber = localStorage.getItem("phoneNumber");
  const patientId = localStorage.getItem("patientId");
  const isPatient = localStorage.getItem("isPatient");

  // 날짜 포맷을 변환하는 유틸리티 함수 (YYYY-MM-DD 형식으로 변환)
  const formatDate = (date: string): string => date.split("T")[0];

  const chatBot = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/patient-chat");
  };

  const schedular = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/patient-schedular");
  };

  const setting = (e: React.FormEvent) => {
    e.preventDefault();

    if (isPatient) {
      navigate("/patient-setting");
    } else {
      navigate("/guardian-setting");
    }
  };

  const handleLogout = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(`${API_BASE_URL}/api/users/logout?phoneNumber=${phoneNumber}`); // 일반 로그아웃
      await axios.post(`${API_BASE_URL}/api/notification/logout`,                      // FCM 토큰 삭제
        {
          "token": token,
          "userId": userId
        }
      );
      await axios.get(`${API_BASE_URL}/api/users/social-login/kakao/logout`);         // 소셜 계정 로그아웃
        localStorage.removeItem("isPatient");
        localStorage.removeItem("patientId");
        localStorage.removeItem("autoLogin");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        alert("로그아웃 완료. 확인 버튼을 누르면 로그인 화면으로 돌아갑니다.")
        console.log('로그아웃 성공');
        navigate('/patient-login');
    } catch (error) {
        console.error('로그아웃 실패:', error);
    }
  };

  // 환자 정보 호출 함수
  const fetchPatientInfo = async () => {
    if (!patientId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/patient/user/${patientId}`);
      const patientData = response.data;
      
      patientData.birthDate = formatDate(patientData.birthDate);
      patientData.hospitalizationDate = formatDate(patientData.hospitalizationDate);
      
      setPatientDto(patientData);
    } catch (error) {
      console.error("환자 정보 조회 중 오류 발생:", error);
    }
  };

  // 일정 정보 호출 함수
  const fetchScheduleInfo = async () => {
    if (!patientId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/schedule/today/${patientId}`);
      const schedules = response.data;

      if (schedules && schedules.length > 0) {
        // 일정들을 날짜 순으로 정렬 (가장 빠른 일정 찾기)
        const sortedSchedules = schedules.sort((a: any, b: any) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());
        setNextSchedule(sortedSchedules[0]); // 가장 빠른 일정
      } else {
        setNextSchedule(null); // 일정이 없으면 null
      }
    } catch (error) {
      console.error("일정 정보 조회 중 오류 발생:", error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    fetchPatientInfo();
    fetchScheduleInfo();
  }, [patientId]);

  
  useEffect(() => {
    if (patientDto?.hospitalId) {
      getHospitalName(patientDto.hospitalId);
      console.log("hospital id: ", patientDto.hospitalId)
    }
  }, [patientDto]);


    // 병원 이름 가져오기
  const getHospitalName = async (hospitalId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/hospital/name/${hospitalId}`);
      setHospitalName(response.data);
    } catch (error) {
      console.error('Error fetching hospital name:', error);
    }
  };

  // 분과 API
  useEffect(() => {
    const fetchMedicalStaff = async () => {
      try {
        const response = await axios.get<MedicalStaff[]>(`${API_BASE_URL}/api/medical-staff/1`);
        setMedicalStaffList(response.data);
        console.log("medicalstafflist: ", response);
      } catch (error){
        console.error("의료진 분과 데이터를 가져오는 중 오류 발생:", error);
      }
    };
    fetchMedicalStaff();
  }, [patientDto?.hospitalId]);


  // 로딩 상태 또는 환자 이름을 표시
  if (!patientDto) {
    return <div>Loading...</div>;  // 데이터가 없을 때 로딩 화면 표시
  }
  

  return (
    <div className="relative flex flex-col items-center h-screen bg-white from-primary-200">
      {/* 메인 로고 */}
      <img
        src="icons/main-page-logo.png"
        alt="Main Logo"
        className="w-[120px] pt-8"
      />
              {/* Logout Button */}
        <div className="absolute right-4 top-4">
          <button
            onClick={handleLogout}
            className="flex items-center text-black bg-white rounded-lg text-[11px]"
          >
          <img src="/icons/logout-icon.png" className="w-[28px] h-[28px] mr-2" alt="로그아웃 아이콘" />
          로그아웃
          </button>
        </div>

      {/* 환자 정보 컨테이너 */}
      <div className="w-4/5 max-w-md bg-primary-50 shadow-lg
      rounded-lg py-2 mb-4 px-2 z-10">
        <div className="m-2">
          <div className="flex justify-center w-[70px] border border-primary-300 bg-white rounded-[60px] px-2 py-1 my-2">
            <p className="text-black text-[12px]">
              {isPatient ? "환자" : "보호자"}
            </p>
          </div>
          <div className="text-black text-right font-bold font-title text-[23px] m-2">
            {patientDto.name} 님
          </div>
          <Separator.Root className="bg-white h-px w-full" decorative />
          <p className="text-black text-[13px] m-2">
            입원 병원: {patientDto.hospitalLocation} {hospitalName ? `${hospitalName}` : ''}
          </p>
          <p className="text-black text-[13px] m-2">
            진료과: {medicalStaffList.length > 0 ? medicalStaffList[0].department : ""}
          </p>
          {/* 다음 일정 안내 컨테이너 */}
          <div className="flex item-center justify-center m-2">
            <div className="w-full max-w-md h-[80px] bg-white shadow-md rounded-lg py-2 mb-2 px-2">
              <p className="text-[15px] font-bold text-primary-300">오늘의 일정</p>
              {nextSchedule ? (
                <div>
                  <p className="text-[13px] text-black">{nextSchedule.details}</p>
                  <p className="text-[13px] text-black">시간: {nextSchedule.scheduleDate}</p>
                </div>
              ) : (
                <p className="text-[13px] m-3 text-black">오늘 일정이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 서비스 컨테이너 */}
      <div className="fixed top-[350px] w-11/12 max-w-[500px] h-[500px] bg-white shadow-lg border
      rounded-t-lg py-8 mb-4 z-0">
        {/* 제목 영역 */}
        <div className="mt-[60px] text-lg font-bold text-center font-title">
          서비스 바로가기
        </div>
        <p className="text-sm text-gray-500 text-center">
          아이콘 클릭시 페이지로 넘어갑니다
        </p>
        <div className="mt-8 flex-row">
          {/* 1. 콜벨 서비스 */}
          <div className="flex flex-col items-center">
            <div className="w-11/12 h-1/2 flex flex-col items-center">
              <button
                onClick={chatBot}
                className="flex items-center justify-center
              w-[300px] h-full shadow-lg rounded-[10px]
              bg-primary-50 border border-primary-100
              "
              >
                <img
                  src="/icons/callbell-icon.png"
                  className="w-[45px] p-1.5"
                />
                <div className="flex justify-center w-[120px]">
                  <p className="mt-1 font-bold text-[15px]">
                    콜벨 서비스
                  </p>
                </div>
              </button>
            </div>
          </div>
          {/* 2. 스케쥴러 */}
          <div className="flex flex-col items-center py-4">
            <div className="w-11/12 h-1/2 flex flex-col items-center">
              <button
                onClick={schedular}
                className="flex items-center justify-center
              w-[300px] h-full shadow-lg rounded-[10px]
              bg-primary-50 border border-primary-100
              "
              >
                <img
                  src="/icons/schedular-icon.png"
                  className="w-[45px] p-1.5 mr-2"
                />
                <div className="flex justify-center w-[120px]">
                  <p className="mt-1 font-bold text-[15px]">
                    스케쥴러
                  </p>
                </div>
              </button>
            </div>
          </div>
          {/* 3. 설정 */}
          <div className="flex flex-col items-center">
            <div className="w-11/12 h-1/2 flex flex-col items-center">
              <button
                onClick={setting}
                className="flex items-center justify-center
              w-[300px] h-full shadow-lg rounded-[10px]
              bg-primary-50 border border-primary-100
              "
              >
                <img
                  src="/icons/user-icon.png"
                  className="w-[45px] p-1.5 mr-2"
                />
                <div className="flex justify-center w-[120px]">
                  <p className="mt-1 font-bold text-[15px]">
                    마이페이지
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMainPage;