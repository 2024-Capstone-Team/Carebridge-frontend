import React, { useState, useEffect, useRef } from "react";
import ChatMessages from "../common/ChatMessages";
import InputSection from "../../components/patient/InputSection";
import { ChatMessage } from "../../types";
import useStompClient from "../../hooks/useStompClient";
import IconButton from "../patient/IconButton";

const useUserContext = () => ({
  nurseId: 1, // for testing
});

interface ChatScreenProps {
  currentRoom: string;
  patientId: number;
  patientName: string;
  onBackClick: () => void;
}

interface Macro {
  macroId: number;
  medicalStaffId: number;
  text: string;
  macroName: string;
}

interface QuickAnswer {
  id: number;
  hospitalId: number;
  category: string;
  title: string;
  information: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  currentRoom,
  patientId,
  patientName,
  onBackClick,
}) => {
  const { nurseId } = useUserContext();
  const [patient, setPatient] = useState(patientName);
  const [inputText, setInputText] = useState("");
  // const [isRoomCreated, setIsRoomCreated] = useState(false);  // backend api not created 
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);  // Initially empty
  const [isLoading, setIsLoading] = useState(true);  // Loading state for chat history

  const [macros, setMacros] = useState<Macro[]>([]);
  const [quickAnswers, setQuickAnswers] = useState<QuickAnswer[]>([]);

  // History stack for undo functionality
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const currentUserId = nurseId;

  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // Save messages to prevent repeated render
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  
  // Get chat history
  const fetchChatHistory = async (patientId: number) => {
    console.log("fetching chat history");
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/message/user?patientId=${patientId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages for patient: ${patientId}`);
      }
      const messages: ChatMessage[] = await response.json();

      // 기존 데이터와 다를 때만 상태 업데이트
      if (JSON.stringify(messages) !== JSON.stringify(chatMessagesRef.current)) {
        chatMessagesRef.current = messages;
        setChatMessages(messages.reverse());
      }
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPatient(patientName); // Update state when patientName prop changes
  }, [patientName]);

  const { subscribeToRoom, sendMessage, isConnected } = useStompClient((message: ChatMessage) => {
    if (message.sender_id !== currentUserId) { // Check if the message is from someone else
      setChatMessages((prevMessages) => [...prevMessages, message]);
    }
  });

  useEffect(() => {
    if (!currentRoom || !isConnected) return;
  
    subscribeToRoom(currentRoom);
    fetchChatHistory(patientId);
  
    return () => {
    };
  }, [currentRoom, isConnected]);

  // Function to mark message as read
  const markMessageAsRead = async (messageId: number) => {
    console.log("Marking message as read.");
    try {
      const url = `http://localhost:8080/api/chat/message/read?messageId=${messageId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if the response is successful (status code 2xx)
      if (!response.ok) {
        // If response status is not OK, throw an error with status text
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // Update local state after marking as read
      setChatMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.messageId === messageId ? { ...message, readStatus: true } : message
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Mark unread messages from others as read
  useEffect(() => {
    const unreadMessagesFromOthers = chatMessages.filter(
      (message) => !message.readStatus && message.sender_id !== currentUserId
    );
    unreadMessagesFromOthers.forEach((message) => markMessageAsRead(message.messageId));
  }, [chatMessages, currentUserId]);

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

  const handleSendMessage = (): void => {
    console.log("Sending message:", inputText);

    if (inputText.trim() && isConnected && patientId) {
      const now = new Date();
      const currentTime = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().replace("Z", "");  // Korean time
      
      const newMessageId = Math.floor(Math.random() * 1_000_000_000);

      const newMessage: ChatMessage = {
        messageId: newMessageId,
        patientId: patientId,
        medicalStaffId: currentUserId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        chatRoomId: currentRoom,
        sender_id: currentUserId,
        isPatient: false,
      };

      setChatMessages((prev) => [...prev, newMessage]);

      const messageToSend = {
        type: "TALK",
        patientId: patientId,
        medicalStaffId: currentUserId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        chatRoomId: currentRoom,
        sender_id: currentUserId,
        isPatient: false,
      };

      sendMessage("/pub/chat/message", messageToSend);
      setInputText("");

      clearHistory(); // clear undo history after sending message
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
  
      if (!isComposing) {
        handleSendMessage(); // to prevent korean being sent twice
      }
    }
  };

  const fetchMacros = async (nurseId: number) => {
    try {
      const response = await fetch(`/api/macro/list/${nurseId}`);
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

  useEffect(() => {
    if (nurseId) {
      fetchMacros(nurseId);
    }
  }, [nurseId]);

  useEffect(() => {
    // Reset the input text and history when the room changes
    setInputText(""); // Clear the text input
    clearHistory(); // Clear the input history stack
    setInputHistory([""]); // Add empty string to history
    setHistoryIndex(0); // Increment history index by 1
  }, [currentRoom]);

  const handleMacroClick = async (macroName: string) => {
    try {
      const response = await fetch(`/api/macro/${nurseId}/${macroName}`);
      const data = await response.text();

      updateInputHistory(data);
      setInputText(data);
    } catch (error) {
      console.error("Error fetching macro text:", error);
    }
  };

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

  const hospitalId = 1;
  const fetchQuickAnswers = async () => {
    try {
      const response = await fetch(`/api/hospital-info/list/${hospitalId}`);
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
  }, [hospitalId]);

  const handleQuickAnswerClick = (qa: QuickAnswer) => {
    updateInputHistory(qa.information);
    setInputText(qa.information);
  };

  return (
    <div className="flex flex-col h-full bg-primary-100 overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-6 text-black z-10 relative">
        <IconButton
          onClick={onBackClick}
          className="absolute left-4 flex items-center justify-center w-10 h-10"
          iconSrc={"/icons/back-icon.png"}
          altText={"Back"}
        />
        <h2 className="text-lg font-bold text-center flex-1">{patient}</h2>
      </header>

      {/* Debug */}
      <div className="mb-2">
        <span className={isConnected ? "text-green-500" : "text-red-500"}>
          {isConnected ? `Connected - Room ID: ${currentRoom}` : "Disconnected"}
        </span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col-reverse">
        <ChatMessages 
        chatMessages={chatMessages} 
        currentUserId={currentUserId} 
        senderBubbleColor="bg-primary-300"
        receiverBubbleColor="bg-white"
        senderTextColor="text-white"
        />
      </div>

      {/* Macros Section */}
      <div className="flex justify-end space-x-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        {macros.map((macro) => (
          <div
            key={macro.macroId}
            onClick={() => handleMacroClick(macro.macroName)}
            className={"flex items-center justify-center px-3 py-1 text-sm rounded-full cursor-pointer bg-primary text-white"}
          >
            {macro.macroName}
          </div>
        ))}
        {quickAnswers.map((qa) => (
          <div
            key={qa.id}
            onClick={() => handleQuickAnswerClick(qa)}
            className="flex items-center justify-center px-3 py-1 text-sm rounded-full cursor-pointer bg-secondary text-white"
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
            onClick: () => handlePhraseUpdate(`/api/macro/phrase-head/${nurseId}`, "prepend"),
          },
          {
            label: "맺음문구 추가",
            onClick: () => handlePhraseUpdate(`/api/macro/phrase-tail/${nurseId}`, "append"),
          },
        ].map((action, index) => (
          <div
            key={index}
            onClick={action.onClick}
            className="flex items-center justify-center px-3 py-1 text-sm rounded-full cursor-pointer bg-primary text-white"
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