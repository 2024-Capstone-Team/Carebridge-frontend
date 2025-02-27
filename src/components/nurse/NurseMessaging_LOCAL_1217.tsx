import React, { useState, useEffect } from "react";
import ChatRoomList from "./ChatRoomList";
import ChatScreen from "./ChatMessageScreen";
import { ChatMessage, ChatRoom } from "../../types";

// Test placeholder
const staffId = "1";

interface ChatRoomListItem {
  userName: string;
  conversationId: string;
  previewMessage: string;
  lastMessageTime: string;
  isRead: boolean;
}

interface NurseMessagingProps {
  selectedConversation?: {
    conversationId: string;
    patientId: number;
    patientName: string;
  } | null;
  onCloseChat?: () => void;
}

const NurseMessaging: React.FC<NurseMessagingProps> = ({ selectedConversation, onCloseChat }) => {
  const [currentRoom, setCurrentRoom] = useState<string>(""); 
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [patientName, setPatientName] = useState<string>("Unknown");
  const [patientId, setPatientId] = useState<number>(5);
  const [isDataFetched, setIsDataFetched] = useState<boolean>(false);

  // 부모로부터 선택된 대화 정보가 있다면 내부 state에 반영
  useEffect(() => {
    if (selectedConversation) {
      setCurrentRoom(selectedConversation.conversationId);
      setPatientName(selectedConversation.patientName);
      setPatientId(selectedConversation.patientId);
    } else {
      setCurrentRoom("");
      setPatientName("Unknown");
      setPatientId(0);
    }
  }, [selectedConversation]);

  // Fetch chatrooms from the server
  const fetchRooms = async () => {
    try {
      const response = await fetch(`/api/chat/message/main/${staffId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch rooms: ${response.statusText}`);
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        const body = await response.text();
        throw new Error(`Expected JSON response but received: ${body}`);
      }

      const roomsData: ChatRoom[] = await response.json();
      const transformedRooms: ChatRoomListItem[] = roomsData.map((room) => ({
        userName: room.userName,
        conversationId: room.conversationId,
        previewMessage: room.previewMessage,
        lastMessageTime: room.lastMessageTime,
        isRead: room.unread,
      }));

      setRooms(transformedRooms);
      setIsDataFetched(true);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Add sample rooms if data is not fetched
  const addSampleRooms = () => {
    const sampleRooms: ChatRoomListItem[] = [
      // Sample data similar to the ones you provided
      {
        userName: "홍길동",
        conversationId: "1_5",
        previewMessage: "물 요청",
        lastMessageTime: "2025-01-20T09:15:00Z",
        isRead: false,
      },
      // Additional sample rooms here...
    ];

    if (!isDataFetched) {
      setRooms(sampleRooms);
    }
  };

  // Handle room selection and update the patient data
  const handleRoomSelect = (roomId: string) => {
    setCurrentRoom(roomId);
    const selectedRoom = rooms.find(room => room.conversationId === roomId);
    if (selectedRoom) {
      setPatientName(selectedRoom.userName);
      const patientId = parseInt(roomId.split('_')[1]);
      setPatientId(patientId);
    }
  };

  // Reset the current chatroom when back button is clicked
  const handleBackClick = () => {
    setCurrentRoom(""); // Clear the current room
    setPatientName("Unknown"); // Reset patient name if needed
    setPatientId(0); // Reset patient ID if needed
  };

  // Fetch rooms and add sample rooms on component mount
  useEffect(() => {
    fetchRooms();
    addSampleRooms();
  }, [staffId]); // Runs only when staffId changes

  return (
    <div className="chatting-content flex-1 h-full overflow-hidden bg-white rounded-lg shadow-lg mr-3">
      <div className="flex h-full">

        {/* Chat Room List */}
        <div className="w-1/4 flex flex-col h-full">
          <ChatRoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomSelect={handleRoomSelect}
          />
        </div>

        {/* Conditionally render Chat Screen or an empty state */}
        <div className="flex-1 h-full">
          {currentRoom ? (
            <ChatScreen
              currentRoom={currentRoom}
              patientId={patientId}
              patientName={patientName}
              onBackClick={handleBackClick}
            />
          ) : (
            <div className="h-full bg-primary-50 flex justify-center items-center">
              <img src="icons/logo_transparent.png" alt="No chat selected" className="w-[303px] h-[113px]" />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default NurseMessaging;