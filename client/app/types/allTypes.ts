import { MutableRefObject } from "react";

export interface Message {
    _id: string; // Assuming MongoDB ObjectId is a string
    sender:string; // User ID of the sender
    content: string;
    createdAt: string; // ISO Date string
    chat:string;
  };
export  interface selectedChatProps{
    messages:Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};
export interface chatBoxProps{
messages:Message[];
boxRef: MutableRefObject<HTMLDivElement | null>;  // ✅ Correctly type boxRef
};

export interface ChatType {
  _id: string;
  name: string;
  latestMessage?: string;
  userId: string;
  count: number;
  lastSeen?: Date | string;
  messages:Message[];
  image?:string
}