import React, { useEffect, useRef, memo } from "react";
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

// Component for rendering each message
const MessageBubble: React.FC<{
  message: ChatMessage;
  isSender: boolean;
  timestamp: string;
  isRead: boolean;
  onResend: (msg: ChatMessage) => void;
  onCancel: (msg: ChatMessage) => void;
  senderBubbleColor: string;
  receiverBubbleColor: string;
  senderTextColor: string;
  receiverTextColor: string;
  customStyles: { [key: string]: string } | undefined;
}> = ({
  message,
  isSender,
  timestamp,
  isRead,
  onResend,
  onCancel,
  senderBubbleColor,
  receiverBubbleColor,
  senderTextColor,
  receiverTextColor,
  customStyles,
}) => (
  <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}>
    {/* Sender's message */}
    {isSender && (
      <div className="flex flex-row items-end mr-3">
        <span className="text-xs text-gray-500">{isRead ? "읽음" : ""}</span>
        <span className="text-xs text-gray-500 ml-2">{formatTimestamp(timestamp)}</span>
      </div>
    )}

    {/* Sender/Receiver message bubble */}
    <div
      className={`max-w-xs px-4 py-2 rounded-3xl ${
        isSender ? senderBubbleColor : receiverBubbleColor
      } ${isSender ? senderTextColor : receiverTextColor} ${
        customStyles?.message || ""
      } whitespace-pre-line`}
    >
      {message.messageContent}
    </div>

    {/* Receiver's message */}
    {!isSender && (
      <div className="flex flex-row items-end ml-3">
        {!message.isFailed ? (  // if message sent then show time and read status
          <>
            <span className="text-xs text-gray-500">{formatTimestamp(timestamp)}</span>
            <span className="text-xs text-gray-500 ml-2">{isRead ? "읽음" : ""}</span>
          </>
        ) : (  // if message failed then show failed text and button instead
          <div className="flex items-center ml-2">
            <span className="text-xs text-red-500 mr-2">전송 실패</span>
            <button className="text-xs text-blue-500 hover:underline" onClick={() => onResend(message)}>
              재전송
            </button>
            <button className="text-xs text-gray-500 hover:underline ml-2" onClick={() => onCancel(message)}>
              취소
            </button>
          </div>
        )}
      </div>
    )}

  </div>
);

interface ChatMessagesProps {
  chatMessages: ChatMessage[];
  currentUserId: number;
  customStyles?: { [key: string]: string };
  senderBubbleColor?: string;
  receiverBubbleColor?: string;
  senderTextColor?: string;
  receiverTextColor?: string;
  onResend: (msg: ChatMessage) => void;
  onCancel: (msg: ChatMessage) => void;
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
    onResend,
    onCancel,
  }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to the bottom when the component first mounts
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 100); // Delay to ensure DOM is fully rendered
    
      return () => clearTimeout(timeoutId); // Cleanup the timeout
    }, []); // Initial mount

    // Scroll to the latest message when chatMessages changes
    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, [chatMessages]);

    return (
      <div className={`space-y-4 overflow-y-auto scrollbar-hide ${customStyles?.container || ""}`}>
        {chatMessages.map((message, index) => {
          const isSender = message.senderId === currentUserId;
          const isRead = message.readStatus;
          return (
            <MessageBubble
              key={index}
              message={message}
              isSender={isSender}
              timestamp={message.timestamp}
              isRead={isRead}
              onResend={onResend}
              onCancel={onCancel}
              senderBubbleColor={senderBubbleColor}
              receiverBubbleColor={receiverBubbleColor}
              senderTextColor={senderTextColor}
              receiverTextColor={receiverTextColor}
              customStyles={customStyles}
            />
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
        (msg, index) =>
          msg.messageContent === nextProps.chatMessages[index].messageContent &&
          msg.readStatus === nextProps.chatMessages[index].readStatus // Check for isRead
      )
    );
  }
);

export default ChatMessages;