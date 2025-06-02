import React, { useEffect, useRef, memo, useState } from "react";
import { ChatMessage } from "../../types";
import { MdOutlineRefresh, MdClose} from "react-icons/md";  
import { motion } from "framer-motion";

// Helper to identify ChatGPT system messages
const isChatGptMessage = (message: ChatMessage) =>
  message.messageContent.startsWith("[ChatGPT로 자동 생성된");

// Helper to identify "요청사항" system messages
const isRequestGeneratedMessage = (message: ChatMessage) =>
  message.messageContent.startsWith("[요청 사항 생성 완료]");

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

// Helper function to format date headers
const formatDateHeader = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  return messageDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  textSize?: string;
  isChatGpt?: boolean;
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
  textSize,
  isChatGpt,
}) => (
  <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4 transition-all duration-300 ease-in-out`}>
    {/* Sender's message */}
    {isSender && (
      <div className="flex flex-row items-end mr-3 ">
        {message.isFailed ? (
          <div className="flex items-center">
            <span className="text-xs text-red-500 mr-2">전송 실패</span>
            
            {/* Resend & Cancel Buttons (Attached, Half-Rounded) */}
            <div className="flex rounded-full overflow-hidden">
              {/* Resend Button (Left Side) */}
              <button className="p-1 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-l-full"
                onClick={() => onResend(message)}>
                <MdOutlineRefresh className="w-5 h-5" />
              </button>

              {/* Cancel Button (Right Side) */}
              <button className="p-1 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-r-full"
                onClick={() => onCancel(message)}>
                <MdClose className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-xs text-gray-400 min-w-[30px]">{isRead ? "읽음" : ""}</span>
          </>
        )}
      </div>
    )}


    {/* Sender/Receiver message bubble and timestamp */}
    <div className={`flex gap-1 ${isSender ? "flex-row-reverse items-end" : "flex-row items-end"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-3xl shadow-sm ${isSender ? "rounded-br-none" : "rounded-bl-none"} ${
          isSender ? senderBubbleColor : receiverBubbleColor
        } ${isSender ? senderTextColor : receiverTextColor} ${
          customStyles?.message || ""
        } whitespace-pre-line`}
        style={{ fontSize: textSize }}
      >
        {isChatGpt ? (
          <div className="flex flex-col">
            <div>{typeof message.messageContent === "string" ? message.messageContent.replace("[ChatGPT로 자동 생성된 답변 입니다.]", "").trim() : message.messageContent}</div>
            <div className="text-right text-gray-700 italic mt-1" style={{ fontSize: "var(--font-caption)" }}>
              ChatGPT가 생성한 응답입니다
            </div>
          </div>
        ) : (
          <>
            {message.messageContent}
          </>
        )}
      </div>
      <div className="text-gray-400 mb-[1px] relative top-[2px] min-w-[60px]" style={{ fontSize: "var(--font-caption)" }}>
        {formatTimestamp(timestamp)}
      </div>
    </div>

    {/* Receiver's message */}
    {!isSender && (
      <div className="flex flex-row items-end ml-3 min-w-[30px]">
        <span className="text-xs text-gray-400">{isRead ? "읽음" : ""}</span>
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
  textSize?: string;
  bottomRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> =
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
    textSize,
    bottomRef,
  }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const hasMountedRef = useRef(false);

    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showNewMessagePreview, setShowNewMessagePreview] = useState(false);
    const [newMessagePreviewText, setNewMessagePreviewText] = useState("");

    const handleScroll = () => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 60;
      setIsAtBottom(nearBottom);
      if (nearBottom) {
        setShowNewMessagePreview(false);
      }
    };

    // Updated scroll-to-bottom logic for chat messages (with system message delay)
    useEffect(() => {
      if (!chatMessages.length) return;

      const lastMessage = chatMessages[chatMessages.length - 1];
      const isRequest = typeof lastMessage.messageContent === "string" &&
        lastMessage.messageContent.startsWith("[요청 사항 생성 완료]");

      const delay = isRequest ? 30 : 0; // Delay for system messages to fully render

      setTimeout(() => {
        const el = scrollContainerRef.current;
        const isReallyAtBottom = el ? el.scrollHeight - el.scrollTop - el.clientHeight < 30 : true;

        if (!hasMountedRef.current) {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
          hasMountedRef.current = true;
        }

        if (isReallyAtBottom) {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
          setShowNewMessagePreview(false);
        } else {
          const contentPreview = typeof lastMessage.messageContent === "string"
            ? lastMessage.messageContent.slice(0, 30) + (lastMessage.messageContent.length > 30 ? "..." : "")
            : "";
          setNewMessagePreviewText(contentPreview);

          const isFromMe = lastMessage.senderId === currentUserId;
          if (!isFromMe) {
            setShowNewMessagePreview(true);
          }
        }
      }, delay);
    }, [chatMessages, currentUserId]);

    // Scroll to bottom if last message is from current user OR if user is already at bottom
    useEffect(() => {
      if (!chatMessages.length) return;
      const lastMessage = chatMessages[chatMessages.length - 1];
      const isFromMe = lastMessage.senderId === currentUserId;

      const el = scrollContainerRef.current;
      const isReallyAtBottom = el ? el.scrollHeight - el.scrollTop - el.clientHeight < 30 : true;

      if (isFromMe || isReallyAtBottom) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            const el = scrollContainerRef.current;
            if (el) el.scrollTop = el.scrollHeight;
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          });
        }, 0);
        setShowNewMessagePreview(false);
      }
    }, [chatMessages, currentUserId]);

    // Show "new message" button if a new message arrives and user is not at bottom
    useEffect(() => {
      if (!chatMessages.length) return;

      const lastMessage = chatMessages[chatMessages.length - 1];
      const isFromMe = lastMessage.senderId === currentUserId;

      const el = scrollContainerRef.current;
      const isNearBottom = el ? el.scrollHeight - el.scrollTop - el.clientHeight < 60 : true;

      if (!isFromMe && !isNearBottom) {
        const contentPreview = typeof lastMessage.messageContent === "string"
          ? lastMessage.messageContent.slice(0, 30) + (lastMessage.messageContent.length > 30 ? "..." : "")
          : "";
        setNewMessagePreviewText(contentPreview);
        setShowNewMessagePreview(true);
      }
    }, [chatMessages, currentUserId]);

    let lastDate: string | null = null;
    let previousSenderId: number | null = null;

    return (
      <div className="relative h-full">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex flex-col px-3 pb-4 overflow-auto h-full scrollbar-hide overscroll-none ${customStyles?.container || ""}`}
          style={{ fontSize: textSize }}
        >
          {chatMessages.map((message, index) => {
            const messageDate = formatDateHeader(message.timestamp);
            const showDateHeader = lastDate !== messageDate;
            lastDate = messageDate; // Update last seen date

            if (isRequestGeneratedMessage(message)) {
              return (
                <React.Fragment key={index}>
                  {showDateHeader && (
                    <div className="text-center text-xs text-gray-500 my-2">
                      {messageDate}
                    </div>
                  )}
                  <div className="relative z-20 text-center text-gray-500 bg-gray-200/90 px-3 py-2 mt-4 mb-4 rounded-md mx-auto max-w-xs whitespace-pre-line" style={{ fontSize: "var(--font-caption)" }}>
                    🤖 {message.messageContent}
                  </div>
                </React.Fragment>
              );
            }

            const isSender = message.senderId === currentUserId;
            const isRead = message.readStatus;

            const isChatGpt = isChatGptMessage(message);
            // If ChatGPT, embed 안내 문구 inside message bubble
            const messageElement = (
              <motion.div
                className={`${previousSenderId === message.senderId ? "mt-1" : "mt-4"}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageBubble
                  message={message}
                  isSender={isSender}
                  timestamp={message.timestamp}
                  isRead={isRead}
                  onResend={onResend}
                  onCancel={onCancel}
                  senderBubbleColor={senderBubbleColor}
                  receiverBubbleColor={isChatGpt ? "bg-slate-100" : receiverBubbleColor}
                  senderTextColor={senderTextColor}
                  receiverTextColor={
                    isChatGpt ? "text-gray-700" : receiverTextColor
                  }
                  customStyles={{
                    ...customStyles,
                    message: `${isChatGpt ? "" : ""}`,
                  }}
                  textSize={textSize}
                  isChatGpt={isChatGpt}
                />
              </motion.div>
            );

            previousSenderId = message.senderId;

            return (
              <React.Fragment key={index}>
                {showDateHeader && (
                  <div className="text-center text-xs text-gray-500 my-2">
                    {messageDate}
                  </div>
                )}
                {messageElement}
              </React.Fragment>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    );
  };

export default React.memo(ChatMessages, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.chatMessages) === JSON.stringify(nextProps.chatMessages)
    && prevProps.currentUserId === nextProps.currentUserId
    && prevProps.customStyles === nextProps.customStyles
    && prevProps.senderBubbleColor === nextProps.senderBubbleColor
    && prevProps.receiverBubbleColor === nextProps.receiverBubbleColor
    && prevProps.senderTextColor === nextProps.senderTextColor
    && prevProps.receiverTextColor === nextProps.receiverTextColor;
});