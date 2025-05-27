import React from "react";

interface ButtonProps {
  text: string;
  onClick: (e: React.FormEvent) => Promise<void>;
  width?: string;      // 버튼 넓이 (옵션)
}


const ClickButton: React.FC<ButtonProps> = ({ text, onClick, width = "100%" }) => {
  return (
    <button
      className="whitespace-nowrap text-white text-[13px] h-10 font-bold rounded-[10px] bg-primary w-full"
      onClick={(e) => onClick(e)}
      style={{ width }} // className = "width-[200px]" 등으로 넓이 따로 설정 가능
    >
      {text}
    </button>
  );
};

export default ClickButton;