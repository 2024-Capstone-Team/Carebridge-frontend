import React from "react";
import { useUserContext } from "../../context/UserContext"; // Import the UserContext
import ChatMessages from "./ChatMessages"; // Adjust the import path as needed
import { ChatMessage } from "../../types"; // Adjust the import path as needed

interface ChatScreenProps {
  currentRoom: string;
  chatMessages: ChatMessage[];
}

const ChatScreen: React.FC<ChatScreenProps> = ({ currentRoom, chatMessages }) => {
  // Get the current user's ID (either userId for patients or nurseId for nurses) from context
  const { userId, nurseId } = useUserContext();
  let currentUserId = userId || nurseId;  // Assuming one of these will be non-null based on the role

  currentUserId = "nurse1";
  if (!currentUserId) {
    return <div>Error: User ID not found!</div>;
  }

  return (
    <div className="">
      <h2 className="text-lg font-bold mb-4">Chatting in {currentRoom}</h2>
      <ChatMessages chatMessages={chatMessages} currentUserId={currentUserId} />
    </div>
  );
};

export default ChatScreen;