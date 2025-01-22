import React, { useState, useEffect, useCallback } from "react";
import { ChatMessage } from '../../types';
import { useUserContext } from '../../context/UserContext.tsx';
import useStompClient from '../../hooks/useStompClient';
import InputSection from '../../components/patient/InputSection.tsx';
import ChatMessages from "../../components/patient/ChatMessages.tsx";
import PatientChatHeader from "../../components/patient/PatientChatHeader.tsx";
import FavoriteRequests from "../../components/patient/FavoriteRequests.tsx";

const PatientChatPage: React.FC = () => {
  const [userId, setUserId] = useState<string>("5"); // Replace with actual user ID
  const [nurseId, setNurseId] = useState<string>("1"); // Replace with actual nurse ID
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      messageId: 1,
      senderId: "nurse_id",
      receiverId: "patient_id",
      messageContent: "안녕하세요, 무엇을 도와드릴까요?",
      timestamp: "10:00 AM",
      readStatus: true,
      conversationId: "conversation_1",
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [favoriteRequests, setFavoriteRequests] = useState<string[]>(["환자복 교체", "물 주세요", "몸이 너무 아파요"]);
  const [connected, setConnected] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>("");

  const { subscribeToRoom, sendMessage, isConnected } = useStompClient((message: ChatMessage) => {
    setChatMessages((prevMessages) => [...prevMessages, message]);
  });

  useEffect(() => {
    if (userId && nurseId) {
      const conversationId = `${nurseId}_${userId}`;
      setRoomId(conversationId); // Set the room ID
      subscribeToRoom(conversationId);
    }
  }, [userId, nurseId, subscribeToRoom]);

  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected]);

  const toggleFavoriteRequest = useCallback((request: string) => {
    setFavoriteRequests((prev) => {
      const updatedRequests = prev.includes(request)
        ? prev.filter((item) => item !== request)
        : [...prev, request];
      localStorage.setItem('favoriteRequests', JSON.stringify(updatedRequests));
      return updatedRequests;
    });
  }, []);

  const sendFavoriteRequestMessage = useCallback((request: string) => {
    sendMessage(`/pub/chat/room/${nurseId}_${userId}`, {
      senderId: userId,
      receiverId: nurseId,
      messageContent: request,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readStatus: false,
      conversationId: `${userId}_${nurseId}`,
    });
  }, [userId, nurseId, sendMessage]);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const text = e.target.value;
    setInputText(text);
  };

  const handleSendMessage = () => {
    if (inputText.trim() && connected && userId && nurseId) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newMessageId = Math.floor(Math.random() * 1_000_000_000);
  
      const newMessage = {
        messageId: newMessageId,
        senderId: userId,
        receiverId: nurseId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        conversationId: `${userId}_${nurseId}`,
      };
  
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      sendMessage(`/pub/chat/room/${userId}_${nurseId}`, newMessage);
      
      console.log("Message sent:", newMessage); // Log the message
  
      setInputText("");
    } else {
      console.log("Message not sent: Either input is empty or not connected");
    }
  };
  
  const sendFavoriteRequest = useCallback((request: string) => {
    const message = {
      senderId: userId,
      receiverId: nurseId,
      messageContent: request,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readStatus: false,
      conversationId: `${userId}_${nurseId}`,
    };
    
    sendMessage(`/pub/chat/room/${userId}_${nurseId}`, message);
    
    console.log("Favorite request sent:", message); // Log the message
  }, [userId, nurseId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <PatientChatHeader title="삼성병원 간호간병 콜벨 서비스" showMenu={true} />
      <FavoriteRequests 
        requests={favoriteRequests} 
        sendFavoriteRequest={sendFavoriteRequest} 
        toggleFavoriteRequest={toggleFavoriteRequest}
      />
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col-reverse">
        <ChatMessages chatMessages={chatMessages} currentUserId={userId || ""} />
      </div>
      
      {!connected ? (
        <div className="text-red-500 text-center">Connecting...</div>
      ) : (
        <div className="text-green-500 text-center">Connected - Room ID: {roomId}</div>
      )}
      <InputSection 
        inputText={inputText} 
        handleInputChange={handleInputChange} 
        handleSendMessage={handleSendMessage} 
        minHeight="1.5rem"   
        maxHeight="10rem"    
        handleKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default PatientChatPage;