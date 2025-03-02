"use client";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo } from "react";
import { chatBoxProps, Message } from "@/app/types/allTypes";
import { FaChevronDown } from "react-icons/fa";
import MessageCardOptions from "./MessageCardOptions";
import { FaBan } from "react-icons/fa6";

const ChatBox: React.FC<chatBoxProps> = ({ messages, boxRef }) => {
  const { dark, user } = useGlobalState();
  const [messageOption, setMessageOption] = useState<Message | null>(null);
  const myId = user?._id;
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleOptions = (message: Message) => {
    if (!messageOption) setMessageOption(message);
    else setMessageOption(null);

  };

  return (
    <Box
      height={"82vh"}
      ref={boxRef}
      w={"100%"}
      overflow={"auto"}
      marginTop={"10vh"}
      padding={"2vh 8%"}
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
          if (message.deletedFor?.includes(user._id)) {
            return null;
          }
          return (
            <div
              className={`message ${
                message?.sender === myId ? "user-message" : "other-user-message"
              }`}
              key={message?._id}
            >
              {messageOption?._id === message?._id && (
                <MessageCardOptions
                  messageOption={messageOption}
                  setMessageOption={setMessageOption}
                />
              )}
              {!message?.deletedForEveryone ? (
                <p>{message?.content} </p>
              ) : (
                <p style={{ color: "#667781" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:'center',
                      gap: "2px",
                    }}
                  >
                    <FaBan /> Message deleted.
                  </span>
                </p>
              )}
              <span className="message-time">{createdAt}</span>
              <FaChevronDown
                color="#aebac1"
                className="downIcon message-down-icon"
                onClick={(e) => {
                  e?.stopPropagation();
                  toggleOptions(message);
                }}
              />
            </div>
          );
        })}
    </Box>
  );
};

export default ChatBox;
