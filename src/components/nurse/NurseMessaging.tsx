import React, { useState, useEffect } from "react";
import ChatRoomList from "./ChatRoomList";
import ChatScreen from "./ChatMessageScreen";
import { ChatMessage } from "../../types";

// Test placeholder
const staffId = "1";

interface Room {
  id: string;
  name: string;
}

interface ChatRoomListItem {
  userName: string;
  conversationId: string;
  previewMessage: string;
  lastMessageTime: number;
  unread: boolean;
}

const NurseMessaging: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>("1_5");
  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [patientName, setPatientName] = useState<string>("Unknown"); // State for patient name
  const [patientId, setPatientId] = useState<number>(5); // State for patient ID (example)

  // Handle room selection and fetch messages for the selected room
  const handleRoomSelect = (roomId: string) => {
    setCurrentRoom(roomId);

    // Assuming roomId can help identify patient details, update patient information accordingly
    const selectedRoom = rooms.find(room => room.conversationId === roomId);
    if (selectedRoom) {
      setPatientName(selectedRoom.userName); // Update patient name based on selected room
      // You might also set patientId if needed, e.g., from room data
    }
  };

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

      const roomsData: Room[] = await response.json();

      const transformedRooms: ChatRoomListItem[] = roomsData.map((room) => ({
        userName: room.name,
        conversationId: room.id,
        previewMessage: "No message",
        lastMessageTime: Date.now(),
        unread: false,
      }));

      setRooms(transformedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchMessagesForRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages for room: ${roomId}`);
      }
      const messages: ChatMessage[] = await response.json();
      setChatMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [staffId]);

  useEffect(() => {
    if (currentRoom) {
      fetchMessagesForRoom(currentRoom);
    }
  }, [currentRoom]);

  return (
    <div className="chatting-content flex-1 bg-white rounded-lg shadow-lg mr-3">
      <div className="flex h-full">
        {/* Chat Room List */}
        <div className="w-1/4 flex">
          <ChatRoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomSelect={handleRoomSelect}
          />
        </div>

        {/* Chat Screen */}
        <div className="flex-1">
          <ChatScreen
            currentRoom={currentRoom}
            chatMessages={chatMessages}
            patientId={patientId}
            patientName={patientName} // Pass the patient name dynamically
          />
        </div>
      </div>
    </div>
  );
};

export default NurseMessaging;