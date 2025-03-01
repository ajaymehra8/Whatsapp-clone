import { MutableRefObject } from "react";
export interface chat {
  _id: string;
}
export interface Message {
  _id: string; // Assuming MongoDB ObjectId is a string
  sender: string; // User ID of the sender
  content: string;
  createdAt: string; // ISO Date string
  chat: chat;
  deletedFor?: string[];
}

export interface selectedChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}
export interface chatBoxProps {
  messages: Message[];
  boxRef: MutableRefObject<HTMLDivElement | null>; // ✅ Correctly type boxRef
}

export interface ChatType {
  _id: string;
  name: string;
  topMessage: Message;
  userId: string;
  count: number;
  lastSeen?: Date | string;
  messages: Message[];
  image?: {
    name: string;
    link: string;
  };
  isPinned: boolean;
}
export interface UserType {
  name: string;
  email: string;
  image: {
    name: string;
    link: string;
  };
  lastSeen?: Date;
  _id: string;
}

