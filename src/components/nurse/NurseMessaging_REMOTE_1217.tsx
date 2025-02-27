import React, { useState, useEffect } from "react";
import ChatRoomList from "./ChatRoomList";
import ChatScreen from "./ChatMessageScreen";
import { ChatMessage, ChatRoom } from "../../types";

// Test placeholder
const staffId = "1";

interface NurseMessagingProps {
  messages: ChatMessage[];
  sendMessage: (destination: string, message: any) => Promise<void>;
  isConnected: boolean;
  markMessageAsRead: (messageId: number) => void;
  rooms: ChatRoom[];
  currentRoom: string;
  onRoomSelect: (roomId: string) => void;
  patientId: number;
  patientName: string;
  subscribeToRoom:(subscriptionPath: string) => void;
  fetchChatHistory:(patientId: number) => Promise<void>;
  updateMessages: (newMessage: ChatMessage) => void;
}

const NurseMessaging:  React.FC<NurseMessagingProps> = ({
  messages,
  sendMessage,
  isConnected,
  markMessageAsRead,
  rooms,
  currentRoom,
  onRoomSelect,
  patientId,
  patientName,
  subscribeToRoom,
  fetchChatHistory,
  updateMessages,
}) => {

  const selectedRoom = rooms.find((room) => room.conversationId === currentRoom);

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    onRoomSelect(roomId); // Pass selection to parent component
  };

  // Handle back click
  const handleBackClick = () => {
    onRoomSelect(""); // Reset selection
  };

  // const [currentRoom, setCurrentRoom] = useState<string>("");
  // const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  // const [patientName, setPatientName] = useState<string>("Unknown");
  // const [patientId, setPatientId] = useState<number>(0);  // initialize patientId to 0
  // const [isDataFetched, setIsDataFetched] = useState<boolean>(false);

  // Fetch chatrooms from the server
  // const fetchRooms = async () => {
  //   try {
  //     const response = await fetch(`/api/chat/message/main/${staffId}`);
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch rooms: ${response.statusText}`);
  //     }

  //     const contentType = response.headers.get("Content-Type");
  //     if (!contentType || !contentType.includes("application/json")) {
  //       const body = await response.text();
  //       throw new Error(`Expected JSON response but received: ${body}`);
  //     }

  //     const roomsData: ChatRoom[] = await response.json();
  //     const transformedRooms: ChatRoomListItem[] = roomsData.map((room) => ({
  //       userName: room.userName,
  //       conversationId: room.conversationId,
  //       previewMessage: room.previewMessage,
  //       lastMessageTime: room.lastMessageTime,
  //       isRead: room.unread,
  //     }));

  //     setRooms(transformedRooms);
  //     setIsDataFetched(true);
  //   } catch (error) {
  //     console.error("Error fetching rooms:", error);

  //   }
  // };

  // // Add sample rooms if data is not fetched (for testing)
  // const addSampleRooms = () => {
  //   const sampleRooms: ChatRoomListItem[] = [
  //     // Sample data similar to the ones you provided
  //     {
  //       userName: "홍길동",
  //       conversationId: "1_5",
  //       previewMessage: "물 요청",
  //       lastMessageTime: "2025-01-20T09:15:00Z",
  //       isRead: false,
  //     },
  //     // Additional sample rooms here...
  //   ];

  //   if (!isDataFetched) {
  //     setRooms(sampleRooms);
  //   }
  // };

  // // Handle room selection and update the patient data
  // const handleRoomSelect = (roomId: string) => {
  //   setCurrentRoom(roomId);
  //   const selectedRoom = rooms.find((room) => room.conversationId === roomId);
  //   if (selectedRoom) {
  //     setPatientName(selectedRoom.userName);
  //     const extractedId = parseInt(roomId.split("_")[1], 10);
  //     setPatientId(isNaN(extractedId) ? 0 : extractedId);
  //   }
  // };

  // // Reset the current chatroom when back button is clicked
  // const handleBackClick = () => {
  //   setCurrentRoom(""); // Clear the current room
  //   setPatientName("Unknown"); // Reset patient name if needed
  //   setPatientId(0); // Reset patient ID if needed
  // };

  // // Fetch chatrooms on mount
  // useEffect(() => {
  //   fetchRooms();
  // }, [fetchRooms]);

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
              messages={messages}
              sendMessage={sendMessage}
              markMessageAsRead={markMessageAsRead}
              isConnected={isConnected}
              subscribeToRoom={subscribeToRoom}
              fetchChatHistory={fetchChatHistory}
              updateMessages={updateMessages}
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