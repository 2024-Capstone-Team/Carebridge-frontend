import React, { useState } from "react";
import ChatRoomList from "./ChatRoomList"; 
import ChatScreen from "./ChatScreen"; 
import { ChatMessage } from "../../types";

const NurseMessaging: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    
  ]);

  const [currentRoom, setCurrentRoom] = useState<string>("Room 1");

  const rooms = ["Room 1", "Room 2", "Room 3"];

  const handleRoomSelect = (room: string) => {
    setCurrentRoom(room);
    // Optionally, load messages for the selected room
    // setChatMessages(loadMessagesForRoom(room));
  };

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
          />
        </div>
      </div>
    </div>
  );
};

export default NurseMessaging;