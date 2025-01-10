import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from '../../types';
import { useUserContext } from '../../context/UserContext.tsx';
import CategoryComponent from '../../components/patient/ChatCategoryComponent.tsx';
import InputSection from '../../components/patient/InputSection.tsx';
import ChatMessages from "../../components/patient/ChatMessages.tsx";
import PatientChatHeader from "../../components/patient/PatientChatHeader.tsx";
import FavoriteRequests from "../../components/patient/FavoriteRequests.tsx";

const PatientChatPage: React.FC = () => {

  const { userId, nurseId } = useUserContext();

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0); // Track selected category
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      messageId: "1",
      senderId: "nurse_id",
      receiverId: "patient_id",
      messageContent: "안녕하세요, 무엇을 도와드릴까요?",
      timestamp: "10:00 AM",
      readStatus: true,
      conversationId: "conversation_1",
    },
    {
      messageId: "2",
      senderId: "patient_id",
      receiverId: "nurse_id",
      messageContent: "물 좀 가져다 주세요.",
      timestamp: "10:01 AM",
      readStatus: false,
      conversationId: "conversation_1",
    },
    {
      messageId: "3",
      senderId: "nurse_id",
      receiverId: "patient_id",
      messageContent: "알겠습니다. 잠시만 기다려 주세요.",
      timestamp: "10:02 AM",
      readStatus: false,
      conversationId: "conversation_1",
    },
    {
      messageId: "4",
      senderId: "patient_id",
      receiverId: "nurse_id",
      messageContent: "화장실을 좀 가고 싶어요.",
      timestamp: "10:05 AM",
      readStatus: true,
      conversationId: "conversation_2",
    },
    {
      messageId: "5",
      senderId: "nurse_id",
      receiverId: "patient_id",
      messageContent: "지금 간호사 호출을 보내고 있어요. 잠시만 기다리세요.",
      timestamp: "10:06 AM",
      readStatus: false,
      conversationId: "conversation_2",
    },
    {
      messageId: "6",
      senderId: "nurse_id",
      receiverId: "patient_id",
      messageContent: "제가 좀 전에 드린 약을 복용했나요?",
      timestamp: "10:10 AM",
      readStatus: false,
      conversationId: "conversation_1",
    },
    {
      messageId: "7",
      senderId: "patient_id",
      receiverId: "nurse_id",
      messageContent: "네, 약을 복용했어요.",
      timestamp: "10:12 AM",
      readStatus: true,
      conversationId: "conversation_1",
    },
    {
      messageId: "8",
      senderId: "nurse_id",
      receiverId: "patient_id",
      messageContent: "좋습니다. 혹시 다른 증상은 없으신가요?",
      timestamp: "10:15 AM",
      readStatus: true,
      conversationId: "conversation_1",
    },
    {
      messageId: "9",
      senderId: "patient_id",
      receiverId: "nurse_id",
      messageContent: "조금 배가 아파요.",
      timestamp: "10:18 AM",
      readStatus: false,
      conversationId: "conversation_1",
    },
    {
      messageId: "10",
      senderId: "nurse_id",
      receiverId: "patient_id",
      messageContent: "알겠습니다. 의사 선생님을 호출하겠습니다.",
      timestamp: "10:20 AM",
      readStatus: false,
      conversationId: "conversation_1",
    },
    {
      messageId: "11",
      senderId: "patient_id",
      receiverId: "nurse_id",
      messageContent: "감사합니다.",
      timestamp: "10:22 AM",
      readStatus: true,
      conversationId: "conversation_1",
    },
    {
      messageId: "12",
      senderId: "nurse_id",
      receiverId: "patient_id",
      messageContent: "괜찮으세요?",
      timestamp: "10:25 AM",
      readStatus: true,
      conversationId: "conversation_1",
    },
    {
      messageId: "13",
      senderId: "patient_id",
      receiverId: "nurse_id",
      messageContent: "네, 이제 조금 나아졌어요.",
      timestamp: "10:27 AM",
      readStatus: true,
      conversationId: "conversation_1",
    },
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

  const fetchConversationId = async (userId: string, nurseId: string) => {
    try {
      const response = await fetch(`/api/conversations/${userId}/${nurseId}`);
      const data = await response.json();
      return data.conversationId;  // Return the conversationId
    } catch (error) {
      console.error('Error fetching conversationId:', error);
      return null;
    }
  };

  const handleSendMessage = (): void => {
    if (inputText.trim() && userId && nurseId) {  // Ensure userId and nurseId are available
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // No seconds

      // Generate a unique messageId (you might want to use a proper UUID or some other method in production)
      const newMessageId = Math.random().toString(36).substring(2, 9);

      setChatMessages((prev) => [
        ...prev,
        { 
          messageId: newMessageId,                // Unique message ID
          senderId: userId,                       // Dynamically assigned senderId
          receiverId: nurseId,                    // Dynamically assigned receiverId
          messageContent: inputText,              // Message content
          timestamp: currentTime,                 // Timestamp
          readStatus: false,                      // Initially unread
          conversationId: `${userId}_${nurseId}`, // Dynamically generated conversationId
        },
      ]);

      setInputText("");  // Clear input field
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

  const sendFavoriteRequest = async (request: string) => {
    if (request.trim() && userId && nurseId) { // Ensure userId and nurseId are available
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Fetch conversationId from the backend
      const conversationId = await fetchConversationId(userId, nurseId);

      // Generate a unique messageId
      const newMessageId = Math.random().toString(36).substring(2, 9);

      if (conversationId) {
        setChatMessages((prev) => [
          ...prev,
          { 
            messageId: newMessageId,
            senderId: userId,                    // Dynamically assigned senderId
            receiverId: nurseId,                 // Dynamically assigned receiverId
            messageContent: request,             // Message content
            timestamp: currentTime,              // Timestamp
            readStatus: false,                   // Initially unread
            conversationId: conversationId,     // Dynamically fetched conversationId
          },
        ]);
      } else {
        console.error('Failed to fetch conversationId');
      }
    }
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
        <ChatMessages chatMessages={chatMessages} currentUserId={""}/>
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