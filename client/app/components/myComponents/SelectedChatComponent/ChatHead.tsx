"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box, Avatar } from "@chakra-ui/react";
import { IoMdArrowRoundBack } from "react-icons/io";

const ChatHead = () => {
  const {
    selectedChat,
    dark,
    onlineUsers,
    setSelectedChat,
    isTyping,
    setOtherUserId,
    otherUserId,
    setShowGroup,
    showGroup,
  } = useGlobalState();
  function formatTimestamp(
    timestamp: Date | string | number | undefined
  ): string {
    if (!timestamp) {
      return "";
    }
    const date: Date = new Date(timestamp);
    const now: Date = new Date();

    const diffMs: number = now.getTime() - date.getTime();
    const diffDays: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate()
    ) {
      return `at ${formattedTime}`;
    }
    // Yesterday (handles month/year transitions)
    else if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return `yesterday at ${formattedTime}`;
    }
    // Older dates
    else {
      return `${diffDays} days ago`;
    }
  }

  const handleBackClick = () => {
    setSelectedChat(null);
  };
  if (!selectedChat) {
    return null;
  }
  return (
    <Box
      height={"10vh"}
      background={dark ? "#202c33" : "#f0f2f5"}
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      padding={"10px 25px 10px 15px"}
      width={{ base: "100%", md: otherUserId || showGroup ? "35%" : "65%" }}
      cursor={"pointer"}
      position={"fixed"}
      top={0}
      zIndex={10}
    >
      <Box
        display={"flex"}
        justifyContent={"start"}
        alignItems={"center"}
        gap={"13px"}
        cursor={"pointer"}
      >
        <IoMdArrowRoundBack
          size={"25px"}
          className="backBtn"
          onClick={handleBackClick}
        />

        <Avatar.Root
          size={"sm"}
          onClick={() => {
            if (selectedChat?.userId) setOtherUserId(selectedChat?.userId);
            if (selectedChat?.isGroupedChat) {
              setOtherUserId(undefined);
              setShowGroup(selectedChat);
            }
          }}
        >
          <Avatar.Fallback name={selectedChat?.name} />
          <Avatar.Image
            src={
              selectedChat?.isGroupedChat
                ? selectedChat?.image?.link ||
                  "https://www.criconet.com/upload/photos/d-group.jpg"
                : selectedChat?.image?.visibility
                ? selectedChat?.image?.link
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
            }
          />
        </Avatar.Root>
        <div
          className="textBox"
          onClick={() => {
            if (selectedChat?.userId) setOtherUserId(selectedChat?.userId);
            if (selectedChat?.isGroupedChat) {
              setOtherUserId(undefined);
              setShowGroup(selectedChat);
            }
          }}
        >
          <p
            style={{
              fontSize: "16px",
              fontWeight: 400,
              padding: 0,
              margin: 0,
              letterSpacing: "1px",
            }}
          >
            {selectedChat?.name}
          </p>
          <p
            style={{
              fontSize: "12px",
              padding: 0,
              margin: 0,
              color: "#667781",
              marginTop: "-2px",
            }}
          >
            {onlineUsers.includes(selectedChat?.userId || selectedChat?._id)
              ? isTyping && isTyping._id === selectedChat._id
                ? "typing..."
                : "Online"
              : !selectedChat?.lastSeen?.visibility
              ? ""
              : `last seen ${formatTimestamp(
                  selectedChat?.lastSeen?.time
                )}`}{" "}
          </p>
        </div>
      </Box>
    </Box>
  );
};

export default ChatHead;
