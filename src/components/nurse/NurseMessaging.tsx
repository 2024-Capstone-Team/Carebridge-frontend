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
  removeEmptyRoom: (conversationId: string) => void;
  patientDetails: {
    [key: number]: {
      patientId: number;
      name: string;
    };
  };
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
  removeEmptyRoom,
  patientDetails,
}) => {
  
  const selectedRoom = rooms.find((room) => room.conversationId === currentRoom);

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    onRoomSelect(roomId); // Pass selection to parent component
  };

  // Handle back click
  const handleBackClick = () => {
    removeEmptyRoom(currentRoom);
    onRoomSelect(""); // Reset selection
  };

  return (
    <div className="chatting-content flex-1 h-full overflow-hidden bg-white rounded-lg shadow-lg mr-3">
      <div className="flex h-full">

        {/* Chat Room List */}
        <div className="w-1/4 flex flex-col h-full">
          <ChatRoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onRoomSelect={handleRoomSelect}
            patientDetails={patientDetails}
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
