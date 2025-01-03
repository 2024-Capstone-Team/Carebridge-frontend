import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from '../../types';
import CategoryComponent from '../../components/patient/ChatCategoryComponent.tsx';
import InputSection from '../../components/patient/InputSection.tsx';
import ChatMessages from "../../components/patient/ChatMessages.tsx";
import PatientChatHeader from "../../components/patient/PatientChatHeader.tsx";
import FavoriteRequests from "../../components/patient/FavoriteRequests.tsx";

const PatientChatPage: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0); // Track selected category
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { text: "안녕하세요, 무엇을 도와드릴까요?", time: "10:00 AM", sender: "nurse" },
    { text: "물 좀 가져다 주세요.", time: "10:01 AM", sender: "user" },
    { text: "알겠습니다. 잠시만 기다려 주세요.", time: "10:02 AM", sender: "nurse" },
    { text: "물통이 어디 있나요?", time: "10:03 AM", sender: "user" },
    { text: "병실의 물통은 옆 선반에 있습니다.", time: "10:04 AM", sender: "nurse" },
    { text: "알겠습니다. 감사합니다.", time: "10:05 AM", sender: "user" },
    { text: "다음에 또 필요한 것이 있으면 말씀해 주세요.", time: "10:06 AM", sender: "nurse" },
    { text: "혹시 커피도 주실 수 있나요?", time: "10:07 AM", sender: "user" },
    { text: "커피는 제공되지 않지만, 차는 준비할 수 있습니다.", time: "10:08 AM", sender: "nurse" },
    { text: "차도 좋습니다. 부탁드립니다.", time: "10:09 AM", sender: "user" },
    { text: "차는 5분 이내에 가져다 드리겠습니다.", time: "10:10 AM", sender: "nurse" },
    { text: "8분 이내 도착 예정입니다.", time: "10:11 AM", sender: "nurse" },
    { text: "간호간병서비스를 제공하는 병실은 18층과 19층에 있습니다.", time: "10:12 AM", sender: "nurse" },
    { text: "잠시만 기다려 주세요. 5분 내로 도착 예정입니다.", time: "10:13 AM", sender: "nurse" },
    { text: "저희 병실은 18층과 19층에서 간호간병서비스를 제공하고 있습니다.", time: "10:14 AM", sender: "nurse" },
    { text: "아, 그렇군요. 고맙습니다.", time: "10:15 AM", sender: "user" },
    { text: "곧 도착할 예정이에요.", time: "10:16 AM", sender: "nurse" },
    { text: "감사합니다!", time: "10:17 AM", sender: "user" },
    { text: "다시 한 번 말씀드리지만, 18층과 19층에서 서비스가 제공됩니다.", time: "10:18 AM", sender: "nurse" },
    { text: "알겠습니다. 고맙습니다.", time: "10:19 AM", sender: "user" },
    { text: "산책하고 싶어요.", time: "10:20 AM", sender: "user" },
    { text: "산책은 안전하게 하셔야 합니다. 잠시만 기다려 주세요.", time: "10:21 AM", sender: "nurse" },
    { text: "네, 기다릴게요.", time: "10:22 AM", sender: "user" },
    { text: "곧 준비해 드리겠습니다. 10분 내로 도착예정입니다.", time: "10:23 AM", sender: "nurse" },
    { text: "감사합니다!", time: "10:24 AM", sender: "user" },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [favoriteRequests, setFavoriteRequests] = useState<string[]>(["환자복 교체", "물 주세요", "몸이 너무 아파요", "몸이 너무 아파요", "몸이 너무 아파요"]);

  const toggleFavoriteRequest = (request: string) => {
    setFavoriteRequests((prev) => {
      const updatedRequests = prev.includes(request)
        ? prev.filter((item) => item !== request)
        : [...prev, request];
      localStorage.setItem('favoriteRequests', JSON.stringify(updatedRequests)); // Save to localStorage
      return updatedRequests;
    });
  };

  const sendFavoriteRequestMessage = (request: string, sendMessage: (text: string) => void) => {
    sendMessage(request);
  };

  // api 연결 후 수정
//   useEffect(() => {
//     const fetchChatHistory = async () => {
//       try {
//         const response = await fetch("/api/chat-history");
//         if (!response.ok) {
//           throw new Error("Failed to fetch chat history");
//         }
//         const data: ChatMessage[] = await response.json();
//         setChatMessages(data);
//       } catch (error) {
//         console.error("Error fetching chat history:", error);
//       }
//     };

//     fetchChatHistory();
//   }, []);

  const fetchCategories = async (text: string): Promise<void> => {
    const mockResponse = ["단순 요청", "물품 요청", "머리감기 요청"];
    setCategories(mockResponse);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const text = e.target.value;
    setInputText(text);
    if (text.trim()) {
      fetchCategories(text);
    } else {
      setCategories([]);
    }
  };

  const handleSendMessage = (): void => {
    if (inputText.trim()) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // No seconds
      setChatMessages((prev) => [
        ...prev,
        { 
          text: inputText, 
          time: currentTime, 
          sender: "user" 
        },
      ]);
      setInputText("");
      setCategories([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // If Shift + Enter is pressed, insert a new line (allow default behavior)
        return;
      } else {
        // If Enter is pressed alone, prevent the default behavior (new line) and send the message
        e.preventDefault(); 
        handleSendMessage(); // Send the message
      }
    }
  };

  const sendFavoriteRequest = (request: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [
      ...prev,
      { 
        text: request, 
        time: currentTime, 
        sender: "user" 
      },
    ]);
  };

  const handleCategoryClick = (index: number) => {
    setSelectedCategory(index); // Set the selected category when clicked
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
        
      {/* Header */}
      <PatientChatHeader
        title="삼성병원 간호간병 콜벨 서비스"
        showMenu={true}
      />
      
      {/* Favorite Requests */}
      <FavoriteRequests 
        requests={favoriteRequests} 
        sendFavoriteRequest={sendFavoriteRequest} 
        toggleFavoriteRequest={toggleFavoriteRequest}
      />

      {/* Chat Section */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col-reverse">
        {/* Chat Messages */}
        <ChatMessages chatMessages={chatMessages} />
      </div>

      {/* Categories Section */}
      <CategoryComponent
        categories={categories}
        selectedCategory={selectedCategory}
        handleCategoryClick={handleCategoryClick}
      />

      {/* Input Section */}
      <InputSection 
        inputText={inputText} 
        handleInputChange={handleInputChange} 
        handleSendMessage={handleSendMessage} 
        minHeight="1.5rem"   // Adjust minHeight here
        maxHeight="10rem"    // Adjust maxHeight here
        handleKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default PatientChatPage;