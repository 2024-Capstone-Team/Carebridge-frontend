import React, { useEffect, useRef } from "react";
import { ChatMessage } from "../../types";

interface ChatMessagesProps {
  chatMessages: ChatMessage[];
  isPatient: boolean; // Distinguish between mobile and desktop
  customStyles?: { [key: string]: string }; // Optional custom styles
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chatMessages, isPatient, customStyles }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return (
    <div
      className={`space-y-4 overflow-y-auto scrollbar-hide ${
        isPatient ? "text-sm" : "text-base"
      } ${customStyles?.container || ""}`}
    >
      {chatMessages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.sender === "user" ? "justify-end" : "justify-start"
          } mb-4`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-3xl ${
              message.sender === "user"
                ? isPatient
                  ? "bg-primary text-white"
                  : "bg-blue-500 text-white"
                : isPatient
                ? "bg-primary-100 text-black"
                : "bg-gray-200 text-black"
            } ${customStyles?.message || ""} whitespace-pre-line`}
          >
            {message.text}
          </div>

          <span
            className={`text-xs text-gray-500 self-end ${
              message.sender === "user" ? "order-first mr-3" : "order-last ml-3"
            }`}
          >
            {message.time}
          </span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;