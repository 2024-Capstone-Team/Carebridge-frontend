export interface ChatMessage {
  messageId: string; 
  senderId: string; 
  receiverId: string; 
  messageContent: string; 
  timestamp: string; 
  readStatus: boolean;
  conversationId?: string; 
}

  export interface HospitalInfo { // temporary for testing
    id: number;
    hospitalId: number;
    category: string;
    title: string;
    information: string;
  }