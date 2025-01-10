import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  className?: string; // className 속성을 추가
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 w-auto h-10 border-none bg-transparent ${className || ""}`}
    >
      <img
        src="icons/back-icon.png"
        alt="뒤로가기 아이콘"
        className="w-6 h-6 hover:opacity-80"
      />
      <span className="text-black font-medium hover:opacity-80">뒤로가기</span>
    </button>
  );
};

export default BackButton;
