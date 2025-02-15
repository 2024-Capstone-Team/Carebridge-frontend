export interface ChatMessage {
  isFailed: boolean;
  messageId: number;
  senderId: number; 
  medicalStaffId: number; 
  messageContent: string;
  timestamp: string;
  readStatus: boolean;
  chatRoomId: string;
  patientId: number; 
  isPatient: boolean;
  isRequest: boolean;
}

export interface RequestDto {
  requestId: number;
  patientId: number;
  medicalStaffId: number;
  requestContent: string;
  status: string;
  requestTime: string;
  acceptTime?: string | null;
}

export interface ChatRoom {
  userName: string;
  conversationId: string; // Unique ID for the conversation (used to group messages)
  previewMessage: string;  // Last message preview in the room
  lastMessageTime: string; // Timestamp of the last message
  unread: boolean;         // Unread message status
}

export interface HospitalInfo { // temporary for testing
  id: number;
  hospitalId: number;
  category: string;
  title: string;
  information: string;
}