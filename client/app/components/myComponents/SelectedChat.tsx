"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box, Avatar } from "@chakra-ui/react";
import { SlOptionsVertical } from "react-icons/sl";
import { Tooltip } from "../ui/tooltip";
import ChatHead from "./SelectedChatComponent/ChatHead";
import ChatBox from "./SelectedChatComponent/ChatBox";
import MessageInput from "./SelectedChatComponent/MessageInput";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Message,selectedChatProps,ChatType} from "@/app/types/allTypes";

const SelectedChat:React.FC<selectedChatProps> = ({messages,setMessages}) => {
  const { selectedChat,socket,setIsTyping,otherUserId } = useGlobalState();
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const fetchMessages = useCallback(() => {
    console.log(selectedChat?.messages);
    if (selectedChat) setMessages(selectedChat.messages);
  }, [selectedChat]);
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

 useEffect(()=>{
  if(socket){
  const handleTyping=(chat:ChatType)=>{
    setIsTyping(chat);
    
  };

      socket.on("typing",handleTyping);
      socket.on("stop_typing",(chat:ChatType)=>setIsTyping(null));

      return ()=>{
        socket.off("typing",handleTyping);
        socket.off("stop_typing",(chat:ChatType)=>setIsTyping(null));
      }
    }
 },[])
  return (
    <Box
      width={{ base: otherUserId?"0":"100%", md: otherUserId?"35%":"65%" }}
      overflow={"hidden"}
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      justifyContent={"center"}
      alignItems={"center"}
    >
      {!selectedChat ? (
        <h1 className="no-content">No chat selected</h1>
      ) : (
        <Box h={"100vh"} w={"100%"} overflow={"hidden"}>
          <ChatHead/>
          <ChatBox messages={messages} boxRef={chatBoxRef} />
          <MessageInput/>
        </Box>
      )}
    </Box>
  );
};

export default SelectedChat;
