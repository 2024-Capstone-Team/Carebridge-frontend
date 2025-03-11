import React, { useEffect, useRef } from "react";
import { IoMdSend } from "react-icons/io"; 

interface InputSectionProps {
  inputText: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  handleCompositionStart?: () => void; 
  handleCompositionEnd?: () => void; 
  minHeight: string; // minHeight prop to adjust the minimum height
  maxHeight: string; // maxHeight prop to adjust the maximum height
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  color?: string; // optional prop for color
}

const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  handleInputChange,
  handleSendMessage,
  handleKeyDown,
  handleCompositionStart, 
  handleCompositionEnd, 
  minHeight,
  maxHeight,
  color = 'bg-primary-100' // Default color if none is passed
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Adjust the height of the textarea based on its content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset the height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
    }
  }, [inputText]);

  return (
    <div className="p-4">
      <div className={`flex items-center p-2 ${color} rounded-3xl relative`}>        
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="메시지를 입력하세요..."
            className={`w-full px-3 py-1 ${color} border-none rounded-3xl focus:outline-none text-black resize-none overflow-y-auto`}
            style={{ minHeight, maxHeight, paddingBottom: "20px" }}
            maxLength={255} // 최대 글자 수 제한
          />
          <span className="absolute bottom-1 right-3 text-xs text-gray-500">
            {inputText.length}/255
          </span>
        </div>
        <button
          onClick={handleSendMessage}
          className={`ml-2 ${color} rounded-full flex items-center justify-center p-2`}
        >
          <IoMdSend className="w-5 h-5 text-primary" />
        </button>
      </div>
    </div>
  );
};

export default InputSection;