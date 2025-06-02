import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ChatMessages from "../common/ChatMessages";
import InputSection from "../../components/patient/InputSection";
import { ChatMessage, Macro, QuickAnswer } from "../../types";
import useStompClient from "../../hooks/useStompClient";
import { FaChevronLeft } from "react-icons/fa";
import { useUserContext } from "../../context/UserContext";

interface ChatScreenProps {
  messages: ChatMessage[];   // Passed from parent
  sendMessage: (destination: string, message: any) => Promise<void>;  // Passed from parent
  markMessageAsRead: (messageId: number) => void; // Passed from parent
  currentRoom: string;
  patientId: number;
  patientName: string;
  isConnected: boolean;  // Connection status from parent
  onBackClick: () => void;
  subscribeToRoom:(subscriptionPath: string) => void;
  fetchChatHistory:(patientId: number) => Promise<void>;
  updateMessages: (newMessage: ChatMessage) => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  sendMessage,
  markMessageAsRead,
  subscribeToRoom,
  fetchChatHistory,
  currentRoom,
  patientId,
  patientName,
  isConnected,
  onBackClick,
  updateMessages,  
}) => {

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  {/* Set constants */}
  // Set nurse ID, hospital ID, patient 
  const { hospitalId: hospitalIdStr } = useUserContext();
  const hospitalId = hospitalIdStr ? Number(hospitalIdStr) : 1;
  const nurseId = hospitalId; // fallback logic: use hospitalId as nurseId

  if (!hospitalIdStr) {
    console.warn("Missing hospitalId in user context. Falling back to nurseId=1, hospitalId=1");
  }

  const patientIdSafe = patientId || 5;

  const [patient, setPatient] = useState(patientName || "Unknown Patient");
  const currentUserId = nurseId;
  const [textSize, setTextSize] = useState("14px");

  {/* State Variables */}
  const [inputText, setInputText] = useState("");  // Input text
  const [isLoading, setIsLoading] = useState(true);  // Loading state for chat history
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);  // Pending messages, to contain failed messages
  const displayedMessages = useMemo(() => {
    return [...messages, ...pendingMessages]
      .map((msg) => ({
        ...msg,
        isFailed: msg.isFailed ?? false,
        isPending: msg.isPending ?? false, 
      }))
      .sort((a, b) => {
        if (a.isPending && !b.isPending) return 1;
        if (!a.isPending && b.isPending) return -1;
        if (a.isFailed && !b.isFailed) return 1;
        if (!a.isFailed && b.isFailed) return -1;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
  }, [messages, pendingMessages]);

  const [macros, setMacros] = useState<Macro[]>([]);  // Set macros
  const [quickAnswers, setQuickAnswers] = useState<QuickAnswer[]>([]);

  // History stack for undo functionality
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isComposing, setIsComposing] = useState(false);  // Check composing

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    });
  }, [displayedMessages]);

  {/* Handlers and Utility Functions */}
  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const updateInputHistory = (newText: string) => {
    // Only save the input text to history if it's changed
    if (newText !== inputText) {
      const updatedHistory = historyIndex === inputHistory.length - 1
        ? [...inputHistory, newText] // Append new text if we're at the end of history
        : [...inputHistory.slice(0, historyIndex + 1), newText]; // Replace undone history
  
      setInputHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1); // Update to point to the new input
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newText = e.target.value;
    updateInputHistory(newText);
    setInputText(newText);
  };

  const handleUndo = (): void => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setInputText(inputHistory[prevIndex]);
      setHistoryIndex(prevIndex);
      console.log("undo");
    }
  };

  const clearHistory = () => {
    setInputHistory([]); // Clear input history
    setHistoryIndex(-1); // Reset history index
  };

  // Log pendingMessages before passing to ChatMessages
  // useEffect(() => {
  //   console.log("Pending messages:", pendingMessages); // Log the messages here
  // }, [pendingMessages]); // This will log whenever pendingMessages changes

  const handleSendMessage = async (): Promise<void> => {
    if (inputText.trim() && patientIdSafe) {
      const now = new Date();
      const currentTime = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().replace("Z", "");  // Korean time
      
      const newMessageId = Math.floor(Math.random() * 1_000_000_000);
  
      const newMessage: ChatMessage = {
        messageId: newMessageId,
        patientId: patientIdSafe,
        medicalStaffId: currentUserId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        chatRoomId: currentRoom,
        senderId: currentUserId,
        isPatient: false,
        isFailed: false,
        isPending: true,
      };
  
      // Add message to pendingMessages
      setPendingMessages((prev) => [...prev, newMessage]);
  
      const messageToSend = {
        patientId: patientIdSafe,
        medicalStaffId: currentUserId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        chatRoomId: currentRoom,
        senderId: currentUserId,
        isPatient: false,
        hospitalId: hospitalId,
      };
  
      try {
        await sendMessage(`/pub/chat/message`, messageToSend);
  
        // After sending, update message to reflect successful send
        updateMessages({ ...newMessage, isPending: false, isFailed: false});
  
        // Remove from pendingMessages array
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.messageId !== newMessageId)
        );
      } catch (error) {
        console.log(`Message failed with ID: ${newMessageId}`);
  
        // Immediately update the pending message to failed state
        setPendingMessages((prev) => {
          if (prev.length === 0) return prev; // No messages to update
        
          return [
            ...prev.slice(0, prev.length - 1), // Keep all previous messages unchanged
            {
              ...prev[prev.length - 1], // Take the last message
              isFailed: true, // Mark it as failed
              isPending: false,
            },
          ];
        });
        
        console.log("Updated failed message:", newMessageId);
      }
  
      // Clear input after sending message
      setInputText("");
      clearHistory(); // Clear undo history after sending message
      if (newMessage.isFailed != null) console.log("Message Status:", newMessage.messageId, newMessage.isFailed);
    }
  };

  const handleResendMessage = async (failedMessage: ChatMessage) => {
    console.log(`Resending message with ID: ${failedMessage.messageId}`);
  
    // Get current time
    const now = new Date();
    const currentTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .replace("Z", ""); // Korean time
  
    // Temporarily set isPending: true while resending
    setPendingMessages((prev) =>
      prev.map((msg) =>
        msg.messageId === failedMessage.messageId
          ? { ...msg, timestamp:currentTime, isPending: true, isFailed: false }
          : msg
      )
    );
  
    // Message to send over the server
    const messageToSend = {
      patientId: patientIdSafe,
      medicalStaffId: failedMessage.medicalStaffId,
      messageContent: failedMessage.messageContent,
      timestamp: currentTime,
      readStatus: false,
      chatRoomId: failedMessage.chatRoomId,
      senderId: failedMessage.senderId,
      isPatient: failedMessage.isPatient,
      messageId: failedMessage.messageId
    };

    try {
      await sendMessage(`/pub/chat/message`, messageToSend);

      // After sending, update message to reflect successful send
      updateMessages({ ...messageToSend, isPending: false , isFailed: false});

      // Remove from pendingMessages array
      setPendingMessages((prev) =>
        prev.filter((msg) => msg.messageId !== failedMessage.messageId)
      );
    } catch (error) {
      console.log(`Message failed with ID: ${failedMessage.messageId}`);

      // Immediately update the pending message to failed state
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === failedMessage.messageId
            ? { ...msg, isFailed: true, isPending: false }  // Mark as failed immediately
            : msg
        )
      );
      console.log("Updated failed message:", failedMessage.messageId);
    }
  
  };
  
  const handleCancelMessage = (failedMessage: ChatMessage) => {
    setPendingMessages((prev) =>
      prev.filter((msg) => msg.messageId !== failedMessage.messageId)
    );
  };  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
  
      if (!isComposing) {
        handleSendMessage(); // to prevent korean being sent twice
      }
    }
  };

  {/* Fetch macros when nurseId is available */}
  const fetchMacros = async (nurseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/macro/list/${nurseId}`);
      const data: Macro[] = await response.json();
      const savedFavorites = localStorage.getItem("favoriteMacroIds");
      
      // 활성화된 즐겨찾기
      if (savedFavorites) {
         const favoriteIds: number[] = JSON.parse(savedFavorites);
         const filteredMacros = data.filter((macro) =>
          favoriteIds.includes(macro.macroId)
        );
        setMacros(filteredMacros);
      } else {
        // 즐겨찾기가 없으면 빈 배열로 설정
        setMacros([]);
      }
    } catch (error) {
      console.error("Error fetching macros:", error);
    }
  };

  {/* Use macro */}
  const handleMacroClick = async (macroName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/macro/${nurseId}/${macroName}`);
      const data = await response.text();

      updateInputHistory(data);
      setInputText(data);
    } catch (error) {
      console.error("Error fetching macro text:", error);
    }
  };

  {/* Use 인사+맺음문구 */}
  const handlePhraseUpdate = async (url: string, position: "prepend" | "append") => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const phrase = await response.text(); 
      
        const updateText = (prev: string) =>
          position === "prepend" ? `${phrase} ${prev}` : `${prev} ${phrase}`;
      
        updateInputHistory(updateText(inputText));
        setInputText(updateText);
      } else {
        console.error("Failed to fetch phrase from", url);
      }
    } catch (error) {
      console.error("Error fetching phrase:", error);
    }
  };

  const fetchQuickAnswers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hospital-info/list/${hospitalIdStr}`);
      const data: QuickAnswer[] = await response.json();
      const savedFavorites = localStorage.getItem("favoriteQuickAnswerIds");
      if (savedFavorites) {
        const favoriteIds: number[] = JSON.parse(savedFavorites);
        const filtered = data.filter((qa) => favoriteIds.includes(qa.id));
        setQuickAnswers(filtered);
      } else {
        setQuickAnswers([]);
      }
    } catch (error) {
      console.error("Error fetching quick answers:", error);
    }
  };

  useEffect(() => {
    fetchQuickAnswers();
  }, [hospitalIdStr]);

  const handleQuickAnswerClick = (qa: QuickAnswer) => {
    updateInputHistory(qa.information);
    setInputText(qa.information);
  };

  {/* Hooks */}
  
  {/* Fetch chat history when connection or room changes */}
  useEffect(() => {
    if (!currentRoom || !isConnected) return;
    setIsLoading(true);           // Mark loading true
    setPendingMessages([]);       // Clear stale pending messages
    subscribeToRoom(`/sub/user/chat/${nurseId}`);
    fetchChatHistory(patientIdSafe).finally(() => setIsLoading(false));
  }, [currentRoom, isConnected]);

  {/* Mark unread messages from others as read */}
  useEffect(() => {
    const unreadMessagesFromOthers = messages.filter(
      (message) => !message.readStatus && message.senderId !== currentUserId
    );
  
    unreadMessagesFromOthers.forEach((message) => markMessageAsRead(message.messageId));
  }, [messages, currentUserId]);  // only messages not pending

  // useEffect(() =>{
  //   console.log(messages);
  // }, [messages]);
  

  {/* Update patient name when prop changes */}
  useEffect(() => {
    setPatient(patientName); 
  }, [patientName]);

  {/* Fetch macros when nurseId is available */}
  useEffect(() => {
    if (nurseId) {
      fetchMacros(nurseId);
    }
  }, [nurseId]);

  {/* Reset input when switching rooms */}
  useEffect(() => {
    setInputText(""); // Clear the text input
    clearHistory(); // Clear the input history stack
    setInputHistory([""]); // Add empty string to history
    setHistoryIndex(0); // Increment history index by 1
  }, [currentRoom]);


  return (
    <div className="flex flex-col h-full bg-primary-100 overflow-hidden">

      {/* Header */}
      <header className="relative flex items-center justify-center pt-6 pb-2 text-black z-10">
        <FaChevronLeft 
          className="absolute left-4 w-[20px] h-[20px] cursor-pointer hover:text-gray-400" 
          onClick={onBackClick} 
        />
        <h2 className="font-bold text-center" style={{ fontSize: "var(--font-title)" }}>
          {patient}
        </h2>
      </header>

      {/* Debug */}
      {/* <div className="mb-2">
        <span className={isConnected ? "text-green-500" : "text-red-500"}>
          {isConnected ? `Connected - Room ID: ${currentRoom}` : "Disconnected"}
        </span>
      </div> */}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col" ref={chatContainerRef}>
        {isLoading ? (
          <div className="text-center text-gray-400 mt-4">Loading chat...</div>
        ) : (
          <ChatMessages 
            chatMessages={displayedMessages} 
            currentUserId={currentUserId} 
            onResend={handleResendMessage}
            onCancel={handleCancelMessage}
            senderBubbleColor="bg-primary-300"
            receiverBubbleColor="bg-white"
            senderTextColor="text-white"
            bottomRef={bottomRef}
            customStyles={{ message: `text-[${textSize}] leading-[${parseInt(textSize) * 1.5}px]` }}
          />
        )}
      </div>

      {/* Macros Section */}
      <div className="flex justify-end space-x-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        {macros.map((macro) => (
          <div
            key={macro.macroId}
            onClick={() => handleMacroClick(macro.macroName)}
            className={"flex items-center justify-center px-3 py-1 rounded-full cursor-pointer bg-primary text-white"}
            style={{ fontSize: "var(--font-body)" }}
          >
            {macro.macroName}
          </div>
        ))}
        {quickAnswers.map((qa) => (
          <div
            key={qa.id}
            onClick={() => handleQuickAnswerClick(qa)}
            className="flex items-center justify-center px-3 py-1 rounded-full cursor-pointer bg-secondary text-white"
            style={{ fontSize: "var(--font-body)" }}
          >
            {qa.title}
          </div>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="flex justify-end space-x-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        {/* Quick Action Button Component */}
        {[
          { label: "실행취소", onClick: handleUndo },
          {
            label: "인사문구 추가",
            onClick: () => handlePhraseUpdate(`${API_BASE_URL}/api/macro/phrase-head/${nurseId}`, "prepend"),
          },
          {
            label: "맺음문구 추가",
            onClick: () => handlePhraseUpdate(`${API_BASE_URL}/api/macro/phrase-tail/${nurseId}`, "append"),
          },
        ].map((action, index) => (
          <div
            key={index}
            onClick={action.onClick}
            className="flex items-center justify-center px-3 py-1 rounded-full cursor-pointer bg-primary text-white"
            style={{ fontSize: "var(--font-body)" }}
          >
            {action.label}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <InputSection
        inputText={inputText}
        handleInputChange={handleInputChange}
        handleSendMessage={handleSendMessage}
        handleKeyDown={handleKeyDown}
        handleCompositionStart={handleCompositionStart}
        handleCompositionEnd={handleCompositionEnd}
        minHeight="1.5rem"
        maxHeight="10rem"
        color="bg-white"
      />
      
    </div>
  );
};

export default ChatScreen;