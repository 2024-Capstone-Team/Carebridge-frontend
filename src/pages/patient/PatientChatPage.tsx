import React, { useState, useEffect, useMemo, useRef, useCallback, useContext } from "react";
import FavoriteRequestsContext from "../../context/FavoriteRequestsContext";
import { ChatMessage } from "../../types";
import useStompClient from "../../hooks/useStompClient";
import InputSection from "../../components/patient/InputSection.tsx";
import ChatMessages from "../../components/common/ChatMessages.tsx";
import PatientChatHeader from "../../components/patient/PatientChatHeader.tsx";
import FavoriteRequests from "../../components/patient/FavoriteRequests.tsx";
import { useUserContext } from "../../context/UserContext";

const PatientChatPage: React.FC = () => {

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  {/* Set constants */}

  // Get userId, nurseId, hospitalId from context
  const { userId: userIdStr, nurseId: nurseIdStr, hospitalId: hospitalIdStr } = useUserContext();

  // Provide fallback values if context is missing
  const userId = userIdStr ? Number(userIdStr) : 5;
  const nurseId = nurseIdStr ? Number(nurseIdStr) : 1;
  const hospitalId = hospitalIdStr ? Number(hospitalIdStr) : 1;

  if (!userIdStr || !nurseIdStr || !hospitalIdStr) {
    // console.warn("Missing user context values. Falling back to default IDs: userId=5, nurseId=1, hospitalId=1");
  }
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const roomId = useMemo(() => `${nurseIdStr}_${userIdStr}`, [nurseIdStr, userIdStr]);

  {/* State Variables */}
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]); //

  const displayedMessages = useMemo(() => {
      return [...chatMessages, ...pendingMessages]
        .map((msg) => ({
          ...msg,
          isFailed: msg.isFailed ?? false,
          isPending: msg.isPending ?? false, 
        }))
        .sort((a, b) => {
          if (a.isPending && !b.isPending) return 1;
          if (!a.isPending && b.isPending) return -1;
          if (a.isFailed && !b.isFailed) return 1;
          if (!a.isFailed && b.isFailed) return -1;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
    }, [chatMessages, pendingMessages]);

  const [inputText, setInputText] = useState<string>("");
  const context = useContext(FavoriteRequestsContext);
  if (!context) throw new Error("PatientChatPage must be used within a FavoriteRequestsProvider");
  const { favoriteRequests } = context;
  const [connected, setConnected] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState(false);
  
  {/* Handlers and Utility Functions */}

  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // Recieve messages
  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/chat/message/user?patientId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");

      const messages: ChatMessage[] = await response.json();
      if (JSON.stringify(messages) !== JSON.stringify(chatMessagesRef.current)) {
        const reversedMessages = messages.reverse();
        chatMessagesRef.current = reversedMessages;
        setChatMessages([...reversedMessages, ...pendingMessages]);
      }
    } catch (error) {
      console.error("Error fetching chat history", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const { subscribeToRoom, sendMessage, isConnected } = useStompClient(
    (message: any) => {
      if (message.type === "MESSAGE") {
        if (message.senderId !== userId) { // Check if the message is from someone else
          setChatMessages((prevMessages) => [...prevMessages, message]);
        }
      } else if (message.messageType === "NOTIFICATION") {  // 읽음 표시 업데이트 
        console.log("Update read status");
        setChatMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.isPatient && !msg.readStatus ? { ...msg, readStatus: true } : msg
          )
        );
      } else {
        console.warn("Unknown message type:", message);
      }
    },
    fetchChatHistory
  );

  // Check if chatroom exists
  const checkIfChatroomExists = useCallback(async (patientId: number): Promise<boolean> => {
    try {
      // Fetch chatroom existence using patientId
      const response = await fetch(`${API_BASE_URL}/api/patient/chatroom/${patientId}`);
  
      if (!response.ok) {
        throw new Error(`Failed to check if chatroom exists: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Chatroom exists: " + data);
      return data; // Returns boolean
    } catch (error) {
      console.error("Error checking chatroom existence:", error);
      return false;
    }
  }, []);

  // Get patient details to create room if chatroom doesn't exist
  const getPatientDetails = useCallback(async (patientId: number) => {
    try {
      // Fetch patient details using patientId
      const response = await fetch(`${API_BASE_URL}/api/patient/user/${patientId}`);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch patient details: ${response.status}`);
      }
  
      return await response.json(); // Return patient details
    } catch (error) {
      console.error("Error fetching patient details:", error);
      return null;
    }
  }, []);
  
  // Create chatroom
  const createChatroom = useCallback(async (patientId: number, department: string): Promise<boolean> => {
    try {
      // Create a new chatroom by sending the patientId and department
      const response = await fetch(`${API_BASE_URL}/api/chat/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, department })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to create chatroom: ${response.status}`);
      }
  
      const data = await response.json();
      return data.success; // Assuming the response has a "success" field
    } catch (error) {
      console.error("Error creating chatroom:", error);
      return false;
    }
  }, []);
  
  // Create ChatRoom if it doesn't exist
  const checkOrCreateChatroom = async () => {
    const patient = await getPatientDetails(userId);
    if (patient) {
      const exists = await checkIfChatroomExists(userId);
      if (!exists) {
        await createChatroom(userId, patient.department);
      }
    }
  };

  {/* Handlers and Utility Functions */}

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (inputText.trim()) {
      const now = new Date();
      const currentTime = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().replace("Z", "");  // Korean time
      
      const newMessageId = Math.floor(Math.random() * 1_000_000_000);
  
      const newMessage: ChatMessage = {
        messageId: newMessageId,
        patientId: userId,
        medicalStaffId: nurseId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,
        chatRoomId: `${nurseIdStr}_${userIdStr}`,
        senderId: userId,
        isPatient: true,
        isFailed: false,
        isPending: true,
      };
  
      // Add message to pendingMessages
      setPendingMessages((prev) => [...prev, newMessage]);
  
      // Message to send over server
      const messageToSend = {
        patientId: userId,
        medicalStaffId: nurseId,
        messageContent: inputText,
        timestamp: currentTime,
        readStatus: false,  
        chatRoomId: `${nurseIdStr}_${userIdStr}`,
        senderId: userId,
        isPatient: true,
        hospitalId: hospitalId,
      };
  
      try {
        await sendMessage(`/pub/chat/message`, messageToSend);
  
        // After sending, update message to reflect successful send
        setChatMessages((prev) => [...prev, { ...newMessage, isPending: false }]);
  
        // Remove from pendingMessages array
        setPendingMessages((prev) =>
          prev.filter((msg) => msg.messageId !== newMessageId)
        );
      } catch (error) {
        console.log(`Message failed with ID: ${newMessageId}`);
  
        // Immediately update the pending message to failed state
        setPendingMessages((prev) => {
          if (prev.length === 0) return prev; // No messages to update
        
          return [
            ...prev.slice(0, prev.length - 1), // Keep all previous messages unchanged
            {
              ...prev[prev.length - 1], // Take the last message
              isFailed: true, // Mark it as failed
              isPending: false,
            },
          ];
        });
        
        console.log("Updated failed message:", newMessageId);
      }
  
      // Clear input after sending message
      setInputText("");
      if (newMessage.isFailed != null) console.log("Message Status:", newMessage.messageId, newMessage.isFailed);
    }
  };

  const handleResendMessage = async (failedMessage: ChatMessage) => {
    console.log(`Resending message with ID: ${failedMessage.messageId}`);
  
    // Get current time
    const now = new Date();
    const currentTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
      .toISOString()
      .replace("Z", ""); // Korean time
  
    // Temporarily set isPending: true while resending
    setPendingMessages((prev) =>
      prev.map((msg) =>
        msg.messageId === failedMessage.messageId
          ? { ...msg, timestamp:currentTime, isPending: true, isFailed: false }
          : msg
      )
    );
  
    // Message to send over the server
    const messageToSend = {
      patientId: failedMessage.patientId,
      medicalStaffId: failedMessage.medicalStaffId,
      messageContent: failedMessage.messageContent,
      timestamp: currentTime,
      readStatus: false,
      chatRoomId: failedMessage.chatRoomId,
      senderId: failedMessage.senderId,
      isPatient: failedMessage.isPatient,
      messageId: failedMessage.messageId
    };

    try {
      await sendMessage(`/pub/chat/message`, messageToSend);

      // After sending, update message to reflect successful send
      setChatMessages((prev) => [...prev, { ...failedMessage, isPending: false, isFailed: false }]);

      // Remove from pendingMessages array
      setPendingMessages((prev) =>
        prev.filter((msg) => msg.messageId !== failedMessage.messageId)
      );
    } catch (error) {
      console.log(`Message failed with ID: ${failedMessage.messageId}`);

      // Immediately update the pending message to failed state
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === failedMessage.messageId
            ? { ...msg, isFailed: true, isPending: false }  // Mark as failed immediately
            : msg
        )
      );
      console.log("Updated failed message:", failedMessage.messageId);
    }
  
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!isComposing) {
        handleSendMessage();  // Prevents premature or duplicate sends during Korean input
      }
    }
  };

  const markMessageAsRead = useCallback(async (messageId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message/read?messageId=${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Failed to mark message as read: ${response.status}`);

      setChatMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.messageId === messageId ? { ...message, readStatus: true } : message
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }, []);

  const sendFavoriteRequest = (request: string) => {
    setInputText(request); 
  };

  const handleCancelMessage = (failedMessage: ChatMessage) => {
    setPendingMessages((prev) =>
      prev.filter((msg) => msg.messageId !== failedMessage.messageId)
    );
  };  


  {/* Hooks */}

  // Create ChatRoom if it doesn't exist
  useEffect(() => {
    checkOrCreateChatroom();
  }, []);

  useEffect(() => {
    if (!roomId || !isConnected) return;
    subscribeToRoom(`/sub/chat/room/${roomId}`);
    fetchChatHistory();
  }, [roomId, isConnected, fetchChatHistory]);

  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedMessages]);


  useEffect(() => {
    const unreadMessages = chatMessages.filter(
      (message) => !message.readStatus && message.senderId !== userId
    );
    unreadMessages.forEach((message) => markMessageAsRead(message.messageId));
  }, [chatMessages, userId, markMessageAsRead]);

  // For chat screen text size
  const [textSize, setTextSize] = useState("14px");
  const increaseTextSize = () => {
    setTextSize((prev) => {
      const size = parseInt(prev);
      return size < 18 ? `${size + 2}px` : prev;
    });
  };

  const decreaseTextSize = () => {
    setTextSize((prev) => {
      const size = parseInt(prev);
      return size > 12 ? `${size - 2}px` : prev;
    });
  };
  
  
  return (
    <div
      className="flex flex-col h-full bg-gray-100 text-sm sm:text-base max-w-screen-sm mx-auto px-2 sm:px-4"
    >
      <PatientChatHeader title="삼성병원 간호간병 콜벨 서비스" showMenu={true} />
      <FavoriteRequests
        requests={favoriteRequests}
        sendFavoriteRequest={sendFavoriteRequest}
      />
      <div className="flex-grow overflow-y-auto px-3 pt-1 flex flex-col gap-1 sm:px-4 sm:gap-2">
        <ChatMessages 
          chatMessages={displayedMessages} 
          currentUserId={userId} 
          onResend={handleResendMessage} 
          onCancel={handleCancelMessage} 
          textSize={textSize}
          senderTextColor="text-white"
          customStyles={{ message: `text-[${textSize}]` }}
          bottomRef={bottomRef}
        />
      </div>

      {/* Debug Line */}
      {/* <div className={`text-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
        {connected ? `Connected - Room ID: ${roomId}` : "Connecting..."}
      </div> */}

      <div className="sticky bottom-0 z-10 bg-gray-100 px-2 pb-[env(safe-area-inset-bottom)]">
        <InputSection
          inputText={inputText}
          handleInputChange={handleInputChange}
          handleSendMessage={handleSendMessage}
          minHeight="2rem"
          maxHeight="8rem"
          handleKeyDown={handleKeyDown}
          handleCompositionStart={handleCompositionStart}
          handleCompositionEnd={handleCompositionEnd}
          showTextSizeButton={true}
          increaseTextSize={increaseTextSize}
          decreaseTextSize={decreaseTextSize}
        />
      </div>
    </div>
  );
};

export default PatientChatPage;