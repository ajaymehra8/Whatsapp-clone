"use client";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { Avatar, Box } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo } from "react";
import { chatBoxProps, Message } from "@/app/types/allTypes";
import { FaChevronDown } from "react-icons/fa";
import MessageCardOptions from "./MessageCardOptions";
import { FaBan } from "react-icons/fa6";

const ChatBox: React.FC<chatBoxProps> = ({ messages, boxRef }) => {
  const { dark, user, selectedChat, setOtherUserId,setShowGroup } = useGlobalState();
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
        (!selectedChat?.isGroupedChat
          ? messages?.map((message, ind) => {
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
                  className={
                    !message?.notification
                      ? `message message-box ${
                          message?.sender?._id === myId
                            ? "user-message user-message-box"
                            : "other-user-message"
                        }`
                      : "message-notification message-notification-box"
                  }
                  key={message?._id}
                  style={{
                    marginTop: !(
                      ind == 0 ||
                      messages[ind - 1]?.sender?._id !== message.sender?._id
                    )
                      ? "3px"
                      : "12px",
                  }}
                >
                  {!message.notification &&
                    messageOption?._id === message?._id && (
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
                          justifyContent: "center",
                          gap: "2px",
                        }}
                      >
                        <FaBan /> Message deleted.
                      </span>
                    </p>
                  )}
                  {!message.notification && (
                    <>
                      {" "}
                      <span className="message-time">{createdAt}</span>
                      <FaChevronDown
                        color="#aebac1"
                        className="downIcon message-down-icon"
                        onClick={(e) => {
                          e?.stopPropagation();
                          toggleOptions(message);
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })
          : messages?.map((message, ind) => {
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
                  className={
                    !message?.notification
                      ? `message-box ${
                          message?.sender?._id === myId
                            ? "user-message-box"
                            : "other-user-message-box"
                        }`
                      : "message-notification-box"
                  }
                  key={message?._id}
                  style={{
                    marginTop: !(
                      ind == 0 ||
                      messages[ind - 1]?.sender?._id !== message.sender?._id
                    )
                      ? "3px"
                      : "12px",
                  }}
                >
                  {!message.notification &&
                    message.sender?._id !== user?._id &&
                    (ind == 0 ||
                      messages[ind - 1]?.sender?._id !==
                        message.sender?._id) && (
                      <Avatar.Root
                        style={{
                          width: "30px",
                          height: "30px",
                        }}
                        onClick={() => {
                          setShowGroup(null);
                          setOtherUserId(message.sender?._id);
                        }}
                      >
                        <Avatar.Fallback name={message.sender?.name} />
                        <Avatar.Image
                          src={
                            message?.sender?.image?.visibility
                              ? message?.sender?.image?.link
                              : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
                          }
                        />
                      </Avatar.Root>
                    )}
                  <div
                    className={
                      !message.notification
                        ? `message ${
                            message?.sender?._id === myId
                              ? "user-message"
                              : `other-user-message`
                          }`
                        : "message-notification"
                    }
                    style={{ maxWidth: "100%" }}
                  >
                    {!message.notification &&
                      messageOption?._id === message?._id && (
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
                            justifyContent: "center",
                            gap: "2px",
                          }}
                        >
                          <FaBan /> Message deleted.
                        </span>
                      </p>
                    )}
                    {!message.notification && (
                      <>
                        {" "}
                        <span className="message-time">{createdAt}</span>
                        <FaChevronDown
                          color="#aebac1"
                          className="downIcon message-down-icon"
                          onClick={(e) => {
                            e?.stopPropagation();
                            toggleOptions(message);
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            }))}
    </Box>
  );
};

export default ChatBox;
