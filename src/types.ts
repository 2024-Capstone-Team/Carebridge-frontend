export interface ChatMessage {
  messageId: string; 
  senderId: string; 
  receiverId: string; 
  messageContent: string; 
  timestamp: string; 
  readStatus: boolean;
  conversationId?: string; 
}

export interface ChatRoom {
  userName: string;
  conversationId: string; // Unique ID for the conversation (used to group messages)
  previewMessage: string;  // Last message preview in the room
  lastMessageTime: number; // Timestamp of the last message
  unread: boolean;         // Unread message status
}

export interface HospitalInfo { // temporary for testing
  id: number;
  hospitalId: number;
  category: string;
  title: string;
  information: string;
}