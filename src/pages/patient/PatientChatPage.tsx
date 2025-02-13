import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ChatMessage } from "../../types";
import useStompClient from "../../hooks/useStompClient";
import InputSection from "../../components/patient/InputSection.tsx";
import ChatMessages from "../../components/common/ChatMessages.tsx";
import PatientChatHeader from "../../components/patient/PatientChatHeader.tsx";
import FavoriteRequests from "../../components/patient/FavoriteRequests.tsx";

const PatientChatPage: React.FC = () => {
  const [userId] = useState<number>(5); 
  const [nurseId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [favoriteRequests, setFavoriteRequests] = useState<string[]>([
    "환자복 교체", "물 주세요", "몸이 너무 아파요"
  ]);
  const [connected, setConnected] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState(false);
  
    const handleCompositionStart = () => {
      setIsComposing(true);
    };
    
    const handleCompositionEnd = () => {
      setIsComposing(false);
    };

  const roomId = useMemo(() => `${nurseId}_${userId}`, [nurseId, userId]);

  const { subscribeToRoom, sendMessage, isConnected } = useStompClient((message: ChatMessage) => {
    if (message.sender_id !== userId) { // Check if the message is from someone else
      setChatMessages((prevMessages) => [...prevMessages, message]);
    }
  });

  const chatMessagesRef = useRef<ChatMessage[]>([]);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/message/user?patientId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");

      const messages: ChatMessage[] = await response.json();
      if (JSON.stringify(messages) !== JSON.stringify(chatMessagesRef.current)) {
        chatMessagesRef.current = messages;
        setChatMessages(messages.reverse());
      }
    } catch (error) {
      console.error("Error fetching chat history", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!roomId || !isConnected) return;
    subscribeToRoom(roomId);
    fetchChatHistory();
  }, [roomId, isConnected, fetchChatHistory]);

  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected]);

  useEffect(() => {
    const storedFavoriteRequests = localStorage.getItem("favoriteRequests");
    if (storedFavoriteRequests) {
      setFavoriteRequests(JSON.parse(storedFavoriteRequests));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputText(e.target.value);
  };

  const handleSendMessage = (): void => {
    if (inputText.trim() && isConnected) {
      // const currentTime = new Date().toISOString().replace("Z", "");  // 한국 시간으로 수정 필요
      const now = new Date();
      const currentTime = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().replace("Z", "");  // Korean time

      const newMessageId = Math.floor(Math.random() * 1_000_000_000);

      const newMessage: ChatMessage = {
        messageId: newMessageId,
        patientId: userId,
        medicalStaffId: nurseId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        chatRoomId: `${nurseId}_${userId}`,
        sender_id: userId,
        isPatient: true,
      };

      setChatMessages((prev) => [...prev, newMessage]);

      const messageToSend = {
        type: "TALK",
        patientId: userId,
        medicalStaffId: nurseId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        chatRoomId: `${nurseId}_${userId}`,
        sender_id: userId,
        isPatient: true,
      };

      sendMessage("/pub/chat/message", messageToSend);
      setInputText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markMessageAsRead = useCallback(async (messageId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/message/read?messageId=${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Failed to mark message as read: ${response.status}`);

      setChatMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.messageId === messageId ? { ...message, readStatus: true } : message
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }, []);

  useEffect(() => {
    const unreadMessages = chatMessages.filter(
      (message) => !message.readStatus && message.sender_id !== userId
    );
    unreadMessages.forEach((message) => markMessageAsRead(message.messageId));
  }, [chatMessages, userId, markMessageAsRead]);

  const sendFavoriteRequest = (request: string) => {
    setInputText(request); 
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <PatientChatHeader title="삼성병원 간호간병 콜벨 서비스" showMenu={true} />
      <FavoriteRequests
        requests={favoriteRequests}
        sendFavoriteRequest={sendFavoriteRequest}
      />
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col-reverse">
        <ChatMessages chatMessages={chatMessages} currentUserId={userId} />
      </div>
      <div className={`text-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
        {connected ? `Connected - Room ID: ${roomId}` : "Connecting..."}
      </div>
      <InputSection
        inputText={inputText}
        handleInputChange={handleInputChange}
        handleSendMessage={handleSendMessage}
        minHeight="1.5rem"
        maxHeight="10rem"
        handleKeyDown={handleKeyDown}
        handleCompositionStart={handleCompositionStart}
        handleCompositionEnd={handleCompositionEnd}
      />
    </div>
  );
};

export default PatientChatPage;