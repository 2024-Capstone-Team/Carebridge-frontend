import React, { useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io"; 
import { MdArrowDropDown, MdArrowDropUp, MdTextFields } from "react-icons/md";
import { FaArrowAltCircleUp, FaArrowAltCircleDown } from "react-icons/fa"; // Import the arrows


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
  showTextSizeButton?: boolean;
  increaseTextSize?: () => void; 
  decreaseTextSize?: () => void;
  textSize?: number; // added textSize prop
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
  color = 'bg-primary-100', // Default color if none is passed
  showTextSizeButton=false,
  increaseTextSize,
  decreaseTextSize,
  textSize = 14, // default font size
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null); // Ref for the popup
  const [showPopup, setShowPopup] = useState(false);

  // Adjust the height of the textarea based on its content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset the height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
    }
  }, [inputText]);

  // Close popup when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Safely check that event.target is not null and cast to Element
      const target = event.target as Element;
      
      // Check if the click is outside the popup and button
      if (target && popupRef.current && !popupRef.current.contains(target) && !target.closest(".text-size-button")) {
        setShowPopup(false); // Close the popup if clicked outside
      }
    };

    document.addEventListener("click", handleClickOutside);

    // Cleanup the event listener when the component is unmounted
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4">
      <div className={`flex items-center p-2 ${color} rounded-3xl relative border border-transparent`}>
        {/* Text Size Button (Conditional) */}
        {showTextSizeButton && (
          <div className="relative text-size-button">
            <button
              className="p-2 rounded-full hover:bg-gray-200 transition bg-transparent"
              onClick={(e) => {
                e.stopPropagation(); // Prevent click event from closing the popup
                setShowPopup(!showPopup); // Toggle the popup
              }}
            >
              <MdTextFields className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Popup for Increase/Decrease Text Size */}
            {showPopup && (
              <div
                ref={popupRef}
                className="absolute left-0 bottom-12 bg-white border shadow-md rounded-lg p-2 flex flex-row space-x-2 z-50"
              >            
                <button
                  onClick={increaseTextSize}
                  className="px-3 py-1 text-sm text-gray-800 hover:bg-gray-100 rounded flex items-center justify-center"
                >
                  <MdArrowDropUp className="mr-1" /> T
                </button>
                <button
                  onClick={decreaseTextSize}
                  className="px-3 py-1 text-sm text-gray-800 hover:bg-gray-100 rounded flex items-center justify-center"
                >
                  <MdArrowDropDown className="mr-1" /> t
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input Box */}
        <div className="relative flex-1">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="메시지를 입력하세요..."
            className={`w-full px-3 pb-[4px] border-none rounded-3xl focus:outline-none text-black resize-none overflow-y-auto align-text-top leading-tight ${color}`}
            style={{ minHeight, maxHeight, paddingBottom: "20px", fontSize: `${textSize}px` }}
            maxLength={255}
            
          />
          <span className="absolute bottom-1 right-3 text-xs text-gray-500">
            {inputText.length}/255
          </span>
        </div>

        {/* Send Button */}
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