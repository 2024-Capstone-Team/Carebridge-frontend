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

  return messageTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

interface ChatMessagesProps {
  chatMessages: ChatMessage[];
  currentUserId: number;
  customStyles?: { [key: string]: string };
  senderBubbleColor?: string;
  receiverBubbleColor?: string;
  senderTextColor?: string;
  receiverTextColor?: string;
  onResend: (msg: ChatMessage) => void;
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
    onResend
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
          const isSender = message.senderId === currentUserId;
          const isRead = message.readStatus;
          return (
            <div key={index} className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}>
            {/* For the sender */}
            {isSender && (
              <div className="flex flex-row items-end mr-3">
                <span className="text-xs text-gray-500">{isRead ? "읽음" : ""}</span>
                <span className="text-xs text-gray-500 ml-2">{formatTimestamp(message.timestamp)}</span>
                <span>
                {message.isFailed && (
                  <button className="ml-2 text-red-500" onClick={() => onResend(message)}>재전송</button>
                )}
                </span>
              </div>
            )}

            {/* Sender/Receiver chat bubble */}
            <div
              className={`max-w-xs px-4 py-2 rounded-3xl ${
                isSender ? senderBubbleColor : receiverBubbleColor
              } ${isSender ? senderTextColor : receiverTextColor} ${
                customStyles?.message || ""
              } whitespace-pre-line`}
            >
              {message.messageContent}
            </div>

            {/* For the receiver */}
            {!isSender && (
              <div className="flex flex-row items-end ml-3">
                <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                <span className="text-xs text-gray-500 ml-2">{isRead ? "읽음" : ""}</span>
              </div>
            )}
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