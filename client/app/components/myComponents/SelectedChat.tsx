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
  const { selectedChat,socket,isTyping,setIsTyping } = useGlobalState();
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const fetchMessages = useCallback(() => {
    if (selectedChat) setMessages(selectedChat.messages);
  }, [selectedChat]);
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

 useEffect(()=>{
  const handleTyping=(chat:ChatType)=>{
    console.log(chat);
    setIsTyping(true)
    
  };
      socket.on("typing",handleTyping);
      socket.on("stop_typing",(chat:ChatType)=>setIsTyping(false));

      return ()=>{
        socket.off("typing",handleTyping);
        socket.off("stop_typing",(chat:ChatType)=>setIsTyping(false));
      }

 },[])
  return (
    <Box
      width={{ base: "100%", md: "65%" }}
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
