import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../../../context/UserContext";
import axios from "axios";
import { AxiosError } from "axios";

// 상수 정의
const ROUTES = {
  PATIENT_SETTING: "/patient-setting",
  BACK_ICON: "src/assets/back.png"
} as const;

// 메시지 상수
const MESSAGES = {
  SUCCESS: "변경 완료",
  SERVER_ERROR: "서버 오류",
  PLACEHOLDER: "수정하고 싶은 전화번호를 입력해주세요."
} as const;

// 모달 컴포넌트
interface ModalProps {
  message: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white text-black p-4 rounded-lg shadow-lg w-10/12 max-w-xs">
      <p>{message}</p>
      <button
        className="mt-4 w-full bg-[#DFE6EC] text-black py-2 rounded-lg"
        onClick={onClose}
      >
        닫기
      </button>
    </div>
  </div>
);

// 헤더 컴포넌트
const Header: React.FC = () => (
  <div className="relative flex items-center p-2 w-full max-w-sm md:max-w-md lg:max-w-lg bg-white">
    <Link to={ROUTES.PATIENT_SETTING} className="absolute left-2 top-1/2 transform -translate-y-1/2">
      <img src={ROUTES.BACK_ICON} alt="뒤로가기" className="w-7" />
    </Link>
    <div className="flex-grow flex items-center justify-center">
      <p className="font-bold text-black">전화번호 수정</p>
    </div>
  </div>
);

const ChangePhoneNum: React.FC = () => {
  // 상태 관리
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { userId, isPatient } = useUserContext();

  // 전화번호 입력 처리
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  // API 요청 처리
  const updatePhoneNumber = async () => {
    const endpoint = isPatient
      ? `http://localhost:8080/api/patient/phone/${userId}`
      : `http://localhost:8080/api/guardian/phone/${userId}`;

    const response = await axios.put(endpoint, { phoneNumber });
    return response.data;
  };

  // 에러 처리
  const handleError = (error: unknown) => {
    if (error instanceof AxiosError) {
      console.error("전화번호 변경 실패:", error);
      if (error.response) {
        console.error("응답 데이터:", error.response.data);
        console.error("응답 상태:", error.response.status);
        console.error("응답 헤더:", error.response.headers);
      } else if (error.request) {
        console.error("요청 데이터:", error.request);
      } else {
        console.error("오류 메시지:", error.message);
      }
    } else {
      console.error("알 수 없는 오류:", error);
    }
    setMessage(MESSAGES.SERVER_ERROR);
  };

  // 제출 처리
  const handleSubmit = async () => {
    try {
      await updatePhoneNumber();
      setMessage(MESSAGES.SUCCESS);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4">
      <Header />
      
      {/* 입력 폼 */}
      <div className="flex flex-col items-center mt-4 w-full max-w-sm md:max-w-md lg:max-w-lg p-4">
        <div className="flex items-center w-full rounded-lg border border-black p-2">
          <input
            className="flex-grow ml-2 text-sm placeholder-gray-500 bg-white text-black"
            placeholder={MESSAGES.PLACEHOLDER}
            value={phoneNumber}
            onChange={handleInputChange}
          />
        </div>
        <button
          className="mt-4 w-full bg-[#DFE6EC] text-black py-2 rounded-lg"
          onClick={handleSubmit}
        >
          확인
        </button>
      </div>

      {/* 모달 */}
      {message && <Modal message={message} onClose={() => setMessage(null)} />}
    </div>
  );
};

export default ChangePhoneNum;