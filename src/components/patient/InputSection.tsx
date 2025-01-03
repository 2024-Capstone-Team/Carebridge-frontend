import React, { useEffect, useRef } from "react";
import { IoMdSend } from "react-icons/io"; 

interface InputSectionProps {
  inputText: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  minHeight: string; // minHeight prop to adjust the minimum height
  maxHeight: string; // maxHeight prop to adjust the maximum height
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  handleInputChange,
  handleSendMessage,
  handleKeyDown,
  minHeight,
  maxHeight,
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
      <div className="flex items-center p-2 bg-primary-100 rounded-3xl">
        {/* Textarea for input */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          className={`flex-1 px-3 py-1 bg-primary-100 border-none rounded-3xl focus:outline-none text-black resize-none overflow-y-auto`}
          style={{
            minHeight, // Use the passed prop
            maxHeight, // Use the passed prop
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          className="ml-2 bg-primary-100 rounded-full flex items-center justify-center"
        >
          <IoMdSend className="w-5 h-5 text-primary" />
        </button>
      </div>
    </div>
  );
};

export default InputSection;