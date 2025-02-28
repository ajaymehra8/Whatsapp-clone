"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box, Avatar } from "@chakra-ui/react";
import { SlOptionsVertical } from "react-icons/sl";
import { IoMdArrowRoundBack } from "react-icons/io";


import { Tooltip } from "../../ui/tooltip";

const ChatHead = () => {
  const { selectedChat, dark, onlineUsers, setSelectedChat, isTyping, setOtherUserId, otherUserId } = useGlobalState();
  function formatTimestamp(timestamp: Date | string | number | undefined): string {
    if (!timestamp) {
      return "";
    }
    const date: Date = new Date(timestamp);
    const now: Date = new Date();
  
    const diffMs: number = now.getTime() - date.getTime();
    const diffHours: number = diffMs / (1000 * 60 * 60);
  
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return `at ${formattedTime}`; // Same day, return time only
    } else if (diffHours < 48 && date.getDate() === now.getDate() - 1) {
      return `yesterday at ${formattedTime}`; // Show "Yesterday + time"
    } else {
      return `${now.getDate()-date.getDate()} days ago`// Older dates include time
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
      height={'10vh'}
      background={dark ? "#202c33" : "#f0f2f5"}
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      padding={"10px 25px 10px 15px"}
      width={{ base: "100%", md: otherUserId ? "35%" : "65%" }}
      top={0}
      cursor={'pointer'}
      position={"fixed"}
      zIndex={10}
    >
      <Box
        display={"flex"}
        justifyContent={"start"}
        alignItems={"center"}
        gap={"13px"}
        cursor={"pointer"}
      >
        <IoMdArrowRoundBack size={"25px"} className="backBtn" onClick={handleBackClick} />

        <Avatar.Root size={"sm"} onClick={() => setOtherUserId(selectedChat?.userId)}
        >
          <Avatar.Fallback name={selectedChat?.name} />
          <Avatar.Image
            src={
              selectedChat?.image?.link ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
            }
          />
        </Avatar.Root>
        <div className="textBox" onClick={() => setOtherUserId(selectedChat?.userId)}
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
              ? (isTyping ? "typing..." : "Online")
              : (isTyping ? "typing..." : `last seen ${formatTimestamp(selectedChat?.lastSeen)}`)}{" "}
          </p>
        </div>
      </Box>
      <Tooltip content="Menu" positioning={{ placement: "bottom" }}>
        <SlOptionsVertical
          size="15px"
          color={dark ? "#aebac1" : "#54656f"}
          cursor="pointer"
          style={{ zIndex: 10 }}
        />
      </Tooltip>
    </Box>
  );
};

export default ChatHead;
