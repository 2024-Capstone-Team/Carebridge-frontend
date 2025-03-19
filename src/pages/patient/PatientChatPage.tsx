import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ChatMessage } from "../../types";
import useStompClient from "../../hooks/useStompClient";
import InputSection from "../../components/patient/InputSection.tsx";
import ChatMessages from "../../components/common/ChatMessages.tsx";
import PatientChatHeader from "../../components/patient/PatientChatHeader.tsx";
import FavoriteRequests from "../../components/patient/FavoriteRequests.tsx";
import { useUserContext } from "../../context/UserContext";

const PatientChatPage: React.FC = () => {

  {/* Set constants */}

  // const { userId } =  useUserContext();
  const [userId] = useState<number>(5);
  const [nurseId] = useState<number>(1);
  const [hospitalId] = useState<number>(1);
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  const roomId = useMemo(() => `${nurseId}_${userId}`, [nurseId, userId]);

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
  const [favoriteRequests, setFavoriteRequests] = useState<string[]>([
    "환자복 교체", "물 주세요", "몸이 너무 아파요"
  ]);  // placeholders
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
  const { subscribeToRoom, sendMessage, isConnected } = useStompClient((message: any) => {
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
  });

  // Check if chatroom exists
  const checkIfChatroomExists = useCallback(async (patientId: number): Promise<boolean> => {
    try {
      // Fetch chatroom existence using patientId
      const response = await fetch(`http://localhost:8080/api/patient/chatroom/${patientId}`);
  
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
      const response = await fetch(`http://localhost:8080/api/patient/user/${patientId}`);
  
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
      const response = await fetch("http://localhost:8080/api/chat/room", {
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

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      // const response = await fetch(`/api/chat/message/user?patientId=${userId}`);
      const response = await fetch(`/api/chat/message/user?patientId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");

      const messages: ChatMessage[] = await response.json();
      if (JSON.stringify(messages) !== JSON.stringify(chatMessagesRef.current)) {
        chatMessagesRef.current = messages;
        setChatMessages(messages.reverse());
      }
      // add pending
      setChatMessages((prev) => [...prev, ...pendingMessages]);
    } catch (error) {
      console.error("Error fetching chat history", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputText(e.target.value);
  };

  // const handleSendMessage = (): void => {
  //   if (inputText.trim()) {
  //     const now = new Date();
  //     const currentTime = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().replace("Z", ""); // Korean time
  
  //     const newMessageId = Math.floor(Math.random() * 1_000_000_000);
  
  //     // Message to store locally (as pending)
  //     const newMessage: ChatMessage = {
  //       messageId: newMessageId,
  //       patientId: userId,
  //       medicalStaffId: nurseId,
  //       messageContent: inputText,
  //       timestamp: currentTime,
  //       readStatus: false,
  //       chatRoomId: `${nurseId}_${userId}`,
  //       senderId: userId,
  //       isPatient: true,
  //       isFailed: false,
  //       isPending: true,
  //     };
  
  //     // Add to pending messages (instead of chatMessages)
  //     setPendingMessages((prev) => [...prev, newMessage]);
  
  //     // Message to send over server
  //     const messageToSend = {
  //       patientId: userId,
  //       medicalStaffId: nurseId,
  //       messageContent: inputText,
  //       timestamp: currentTime,
  //       readStatus: false,
  //       chatRoomId: `${nurseId}_${userId}`,
  //       senderId: userId,
  //       isPatient: true,
  //       hospitalId: hospitalId,
  //     };
  
  //     // Send message
  //     sendMessage("/pub/chat/message", messageToSend)
  //       .then(() => {
  //         // Move message to chatMessages and remove from pendingMessages
  //         setChatMessages((prev) => [...prev, { ...newMessage, isPending: false }]);
  //         setPendingMessages((prev) => prev.filter((msg) => msg.messageId !== newMessageId));
  //       })
  //       .catch(() => {
  //         console.log("Message failed to send.");
  
  //         // Mark message as failed in pendingMessages
  //         setPendingMessages((prev) =>
  //           prev.map((msg) =>
  //             msg.messageId === newMessageId ? { ...msg, isFailed: true, isPending: false } : msg
  //           )
  //         );
  //       });
  
  //     setInputText("");
  //   }
  // };
  

  // const handleResendMessage = (failedMessage: ChatMessage) => {
  //   console.log(`Resending message with ID: ${failedMessage.messageId}`);
  
  //   // Get current time
  //   const now = new Date();
  //   const currentTime = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().replace("Z", ""); // Korean time
  
  //   // Message to send over server
  //   const messageToSend = {
  //     patientId: failedMessage.patientId,
  //     medicalStaffId: failedMessage.medicalStaffId,
  //     messageContent: failedMessage.messageContent,
  //     timestamp: currentTime,
  //     readStatus: false,
  //     chatRoomId: `${nurseId}_${userId}`,
  //     senderId: userId,
  //     isPatient: true,
  //   };
  
  //   // Send message and update state accordingly
  //   sendMessage("/pub/chat/message", messageToSend)  
  //     .then(() => {
  //       // If successfully sent, update isFailed and timestamp, and move the message to correct position
  //       setChatMessages((prev) => {
  //         const updatedMessages = prev.map((msg) =>
  //           msg.messageId === failedMessage.messageId
  //             ? { ...msg, isFailed: false, timestamp: currentTime }
  //             : msg
  //         );
  
  //         // Separate successful and failed messages
  //         const successfulMessages = updatedMessages.filter((msg) => !msg.isFailed);
  //         const failedMessages = updatedMessages.filter((msg) => msg.isFailed);
  
  //         // Return new order: successful messages first, then failed ones
  //         return [...successfulMessages, ...failedMessages];
  //       });
  //     })
  //     .catch(() => {
  //       // If failed again, update the timestamp but keep isFailed as true
  //       setChatMessages((prev) =>
  //         prev.map((msg) =>
  //           msg.messageId === failedMessage.messageId
  //             ? { ...msg, timestamp: currentTime }
  //             : msg
  //         )
  //       );
  //     });
  // };

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
        chatRoomId: `${nurseId}_${userId}`,
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
        chatRoomId: `${nurseId}_${userId}`,
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
      handleSendMessage();
    }
  };

  const markMessageAsRead = useCallback(async (messageId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat/message/read?messageId=${messageId}`, {
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
    const storedFavoriteRequests = localStorage.getItem("favoriteRequests");
    if (storedFavoriteRequests) {
      setFavoriteRequests(JSON.parse(storedFavoriteRequests));
    }
  }, []);

  useEffect(() => {
    const unreadMessages = chatMessages.filter(
      (message) => !message.readStatus && message.senderId !== userId
    );
    unreadMessages.forEach((message) => markMessageAsRead(message.messageId));
  }, [chatMessages, userId, markMessageAsRead]);

  // For chat screen text size
  const [textSize, setTextSize] = useState("14px");
  const increaseTextSize = () => {
    setTextSize((prev) => `${parseInt(prev) + 2}px`);
  };

  const decreaseTextSize = () => {
    setTextSize((prev) => `${Math.max(parseInt(prev) - 2, 10)}px`); // Min size 10px
  };
  
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <PatientChatHeader title="삼성병원 간호간병 콜벨 서비스" showMenu={true} />
      <FavoriteRequests
        requests={favoriteRequests}
        sendFavoriteRequest={sendFavoriteRequest}
      />
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col-reverse">
        <ChatMessages chatMessages={displayedMessages} currentUserId={userId} onResend={handleResendMessage} onCancel={handleCancelMessage} textSize={textSize}/>
      </div>

      {/* Debug Line */}
      {/* <div className={`text-center ${connected ? 'text-green-500' : 'text-red-500'}`}>
        {connected ? `Connected - Room ID: ${roomId}` : "Connecting..."}
      </div> */}

      <InputSection
      inputText={inputText}
      handleInputChange={handleInputChange}
      handleSendMessage={handleSendMessage}
      minHeight="1.5rem"
      maxHeight="10rem"
      handleKeyDown={handleKeyDown}
      handleCompositionStart={handleCompositionStart}
      handleCompositionEnd={handleCompositionEnd}
      showTextSizeButton={true}
      increaseTextSize={increaseTextSize}
      decreaseTextSize={decreaseTextSize}
      />
    </div>
  );
};

export default PatientChatPage;