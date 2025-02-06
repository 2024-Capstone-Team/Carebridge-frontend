import React, { useEffect, useMemo, useRef, memo } from "react";
import { ChatMessage } from "../../types";

// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  let messageTime = new Date(timestamp);

  if (isNaN(messageTime.getTime())) {
    console.warn("Invalid ISO format. Attempting to convert from 'YYYY-MM-DD HH:mm:ss' format.");

    const customFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (customFormatRegex.test(timestamp)) {
      timestamp = timestamp.replace(" ", "T");
      messageTime = new Date(timestamp);
    } else {
      throw new Error("Invalid timestamp format");
    }
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return messageTime.toLocaleTimeString([], options);
};

interface ChatMessagesProps {
  chatMessages: ChatMessage[];
  currentUserId: number;
  customStyles?: { [key: string]: string };
  senderBubbleColor?: string;
  receiverBubbleColor?: string;
  senderTextColor?: string;
  receiverTextColor?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = memo(
  ({
    chatMessages,
    currentUserId,
    customStyles,
    senderBubbleColor = "bg-primary",
    receiverBubbleColor = "bg-primary-100",
    senderTextColor = "text-black",
    receiverTextColor = "text-black",
  }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    // const reversedMessages = useMemo(() => [...chatMessages].reverse(), [chatMessages]);

    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [chatMessages]);

    return (
      <div className={`space-y-4 overflow-y-auto scrollbar-hide ${customStyles?.container || ""}`}>
        {chatMessages.map((message, index) => {
          const isSender = message.sender_id === currentUserId;
          return (
            <div key={index} className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-3xl ${
                  isSender ? senderBubbleColor : receiverBubbleColor
                } ${isSender ? senderTextColor : receiverTextColor} ${
                  customStyles?.message || ""
                } whitespace-pre-line`}
              >
                {message.messageContent}
              </div>

              <span
                className={`text-xs text-gray-500 self-end ${
                  isSender ? "order-first mr-3" : "order-last ml-3"
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.chatMessages.length === nextProps.chatMessages.length &&
      prevProps.currentUserId === nextProps.currentUserId &&
      prevProps.chatMessages.every(
        (msg, index) => msg.messageContent === nextProps.chatMessages[index].messageContent
      )
    );
  }
);

export default ChatMessages;