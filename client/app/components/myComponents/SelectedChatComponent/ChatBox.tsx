"use client";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo } from "react";
import { chatBoxProps, Message } from "@/app/types/allTypes";

const ChatBox:React.FC<chatBoxProps> = ({ messages, boxRef}) => {
  const { dark, user } = useGlobalState();
  const myId = user._id;
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box
      height={"82vh"}
      ref={boxRef}
      w={"100%"}
      overflow={"auto"}
      marginTop={"10vh"}
      padding={"2vh 8vw"}
      display={"flex"}
      flexDirection={"column"}
      background={dark ? "#11191f" : "#e7dcd4"}
    >
      {messages &&
        messages?.map((message) => {
          let createdAt: Date | string = new Date(message?.createdAt);
          createdAt = createdAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          return (
            <div
              className={`message ${
                message?.sender._id=== myId
                  ? "user-message"
                  : "other-user-message"
              }`}
              key={message?._id}
            >
              <p>{message?.content} </p>
              <span className="message-time">{createdAt}</span>
            </div>
          );
        })}
    </Box>
  );
};

export default ChatBox;
