export interface ChatMessage {
  isPending: boolean;  // local, not for db
  isFailed: boolean;  // local, not for db
  messageId: number;
  senderId: number; 
  medicalStaffId: number; 
  messageContent: string;
  timestamp: string;
  readStatus: boolean;
  chatRoomId: string;
  patientId: number; 
  isPatient: boolean;
}

export interface CallBellRequest {
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
  conversationId: string; 
  previewMessage: string;  // Last message preview in the room
  lastMessageTime: string; // Timestamp of the last message
  isRead: boolean;         // Unread message status
}

export interface Macro {
  macroId: number;
  medicalStaffId: number;
  text: string;
  macroName: string;
}

export interface PatientDetail {
  patientId: number;
  phoneNumber: string;
  name: string;
  birthDate: string; 
  gender: string;
  guardianContact: string;
  hospitalId: number;
  hospitalLocation: string;
  chatRoomId: string;
  department: string;
  email: string;
  hospitalizationDate: string;
  userId: number;
}

export interface HospitalInfo { // temporary for testing
  id: number;
  hospitalId: number;
  category: string;
  title: string;
  information: string;
}

// 채팅을 위한 인터페이스
export interface ChatConversation {
  conversationId: string;
  patientId: number;
  patientName: string;
}

export interface MedicalStaff {
  medicalstaffId: number;
  department: string;
  hospitalId: number;
  phraseHead: string;
  phraseTail: string;
}

export interface QuickAnswer {
  id: number;
  hospitalId: number;
  category: string;
  title: string;
  information: string;
}