import React, { useEffect, useRef } from "react";
import { ChatMessage } from "../../types";

interface ChatMessagesProps {
  chatMessages: ChatMessage[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chatMessages }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom when the component is first rendered
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView(); // No smooth scrolling, just jump to the bottom
    }
  }, []); // Runs once when the component mounts

  // Scroll to the bottom whenever chatMessages changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]); // Trigger effect on chatMessages change

  return (
    <div className="space-y-4 overflow-y-auto scrollbar-hide">
      {chatMessages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-3xl ${
              message.sender === "user" ? "bg-primary text-white" : "bg-primary-100 text-black"
            } whitespace-pre-line`}
          >
            {message.text}
          </div>

          {/* Time */}
          <span
            className={`text-xs text-gray-500 self-end ${
              message.sender === "user" ? "order-first mr-3" : "order-last ml-3"
            }`}
          >
            {message.time}
          </span>
        </div>
      ))}
      {/* Scroll reference */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;