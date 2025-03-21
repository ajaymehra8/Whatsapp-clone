import { MutableRefObject } from "react";
export interface chat {
  _id: string;
}
export interface UserType {
  name: string;
  email: string;
  image?: {
    name: string;
    link: string;
    visibility?:boolean
  };
  lastSeen?: {time:Date|string,visibility:boolean};
  _id: string;
  about?:{content:string,visibility:boolean};
}
export interface Message {
  _id: string; // Assuming MongoDB ObjectId is a string
  sender: UserType; // User ID of the sender
  content: string;
  createdAt: string; // ISO Date string
  chat: chat;
  deletedFor?: string[];
  deletedForEveryone?:boolean;
  notification?:string
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
  userId?: string;
  count: number;
  lastSeen?: {time:Date|string,visibility?:boolean};
  messages?: Message[];
  isGroupedChat?:boolean;
  users?:UserType[];
  groupAdmin?:string;
  image?: {
    name: string;
    link: string;
    visibility?:boolean
  };
  isPinned?: boolean;
}


