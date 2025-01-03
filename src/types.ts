export interface ChatMessage {
    text: string;
    time: string;
    sender: "user" | "nurse";
  }