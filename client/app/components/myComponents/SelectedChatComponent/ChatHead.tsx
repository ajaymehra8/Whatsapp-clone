"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box, Avatar } from "@chakra-ui/react";
import { SlOptionsVertical } from "react-icons/sl";
import { IoMdArrowRoundBack } from "react-icons/io";


import { Tooltip } from "../../ui/tooltip";
const ChatHead = () => {
  const { selectedChat, dark, onlineUsers,setSelectedChat,isTyping } = useGlobalState();
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
        // Format time like 2:30 PM or 2:00 AM
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    } else if (diffHours < 48) {
        return "Yesterday";
    } else {
        // Format as "2-Feb"
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short"
        });
    }
}
const handleBackClick=()=>{
  setSelectedChat(null);
};
  return (
    <Box
      h={"10vh"}
      background={dark ? "#202c33" : "#f0f2f5"}
      display={"flex"}
      justifyContent={"space-between"}
      alignItems={"center"}
      padding={"5px 25px 5px 15px"}
      w={"100%"}
      top={0}
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
<IoMdArrowRoundBack size={"25px"} className="backBtn" onClick={handleBackClick}/>

        <Avatar.Root size={"sm"} bg={"blue"}>
          <Avatar.Fallback name={selectedChat?.name} />
          <Avatar.Image
            src={
              selectedChat?.image ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
            }
          />
        </Avatar.Root>
        <div className="textBox">
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
            {onlineUsers.includes(selectedChat.userId||selectedChat._id)
              ? (isTyping?"typing...":"Online")
              : (isTyping?"typing...":`last seen at ${formatTimestamp(selectedChat.lastSeen)}`)}{" "}
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
