import { MutableRefObject } from "react";

export interface Message {
    _id: string; // Assuming MongoDB ObjectId is a string
    sender:{_id:string}; // User ID of the sender
    content: string;
    createdAt: string; // ISO Date string
  };
export  interface selectedChatProps{
    messages:Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};
export interface chatBoxProps{
messages:Message[];
boxRef: MutableRefObject<HTMLDivElement | null>;  // ✅ Correctly type boxRef
};
export interface chatType{
name:string;
count:number;
date:Date;
messages:Message[];
userId:string;
_id:string;
}