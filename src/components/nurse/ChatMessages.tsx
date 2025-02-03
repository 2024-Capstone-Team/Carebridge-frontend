import React, { useEffect, useRef } from "react";
import { ChatMessage } from "../../types";

interface ChatMessagesProps {
  chatMessages: ChatMessage[];
  currentUserId: string;  // Pass the current user's ID as a prop
  customStyles?: { [key: string]: string }; // Optional custom styles
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  chatMessages,
  currentUserId,
  customStyles,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom when the component is first rendered or on new messages
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
    <div className={`space-y-4 overflow-y-auto scrollbar-hide ${customStyles?.container || ""}`}>
      {chatMessages.map((message, index) => {
        const isSender = message.senderId === currentUserId;
        return (
          <div
            key={index}
            className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-3xl ${
                isSender
                  ? "bg-primary text-white"
                  : "bg-primary-100 text-black"
              } ${customStyles?.message || ""} whitespace-pre-line`}
            >
              {message.messageContent}
            </div>

            <span
              className={`text-xs text-gray-500 self-end ${
                isSender ? "order-first mr-3" : "order-last ml-3"
              }`}
            >
              {message.timestamp}
            </span>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;