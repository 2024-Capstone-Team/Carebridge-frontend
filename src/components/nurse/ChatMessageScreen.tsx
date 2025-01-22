import React, { useState, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import { ChatMessage } from "../../types";
import useStompClient from "../../hooks/useStompClient";

const useUserContext = () => ({
  nurseId: "1" // Hardcoded nurseId for now
});

interface ChatScreenProps {
  currentRoom: string;
  chatMessages: ChatMessage[];
  patientId: number;
  patientName: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  currentRoom,
  chatMessages: initialMessages,
  patientId,
  patientName
}) => {
  const { nurseId } = useUserContext();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [connected, setConnected] = useState(false);
  const [isRoomCreated, setIsRoomCreated] = useState(false);

  const currentUserId = nurseId;

  const { subscribeToRoom, sendMessage, isConnected } = useStompClient((newMessage) => {
    console.log('Received message:', newMessage);
    if (newMessage.conversationId === `${currentUserId}_${patientId}`) {
      console.log('Message matches current room and patient');
      setChatMessages((prev) => [...prev, newMessage]);
    } else {
      console.log('Message does not match current room');
    }
  });

  useEffect(() => {
    if (!currentUserId || !patientId || !isConnected || isRoomCreated) {
      return;
    }

    const createChatRoom = async () => {
      try {
        console.log("Chat room created:", {
          roomId: `${currentRoom}`,
          patientId,
          medicalStaffId: currentUserId,
        });
        setIsRoomCreated(true); // Set the flag to true after creating the room
      } catch (error) {
        console.error("Error creating chat room:", error);
      }
    };

    createChatRoom();
    subscribeToRoom(currentRoom);
  }, [currentRoom, patientId, isConnected, currentUserId, subscribeToRoom, isRoomCreated]);

  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputText(e.target.value);
  };

  const handleSendMessage = (): void => {
    if (inputText.trim() && connected && patientId) {
      const currentTime = new Date().toISOString();
      const newMessageId = Math.floor(Math.random() * 1_000_000_000);

      const newMessage: ChatMessage = {
        messageId: newMessageId,
        senderId: currentUserId,
        receiverId: patientId.toString(),
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        conversationId: `${currentRoom}`,
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setInputText("");
      sendMessage("/pub/chat/message", newMessage);

      // Log message to console
      console.log("Message sent:", newMessage);
    } else {
      console.log("STOMP client not connected yet or input is empty");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">
        Chatting with {patientName} (ID: {patientId}, Room: {currentRoom})
      </h2>
      <div className="mb-2">
        <span className={connected ? "text-green-500" : "text-red-500"}>
          {connected ? `Connected - Room ID: ${currentRoom}` : "Disconnected"}
        </span>
      </div>
      <ChatMessages chatMessages={chatMessages} currentUserId={currentUserId} />
      <textarea
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleSendMessage}
        disabled={!inputText.trim() || !connected}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>
      {!connected && <div>Connecting...</div>}
    </div>
  );
};

export default ChatScreen;