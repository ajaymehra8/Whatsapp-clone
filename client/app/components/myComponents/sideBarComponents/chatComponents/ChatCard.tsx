"use client";
import { toaster } from "@/app/components/ui/toaster";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { chats } from "@/app/utils/api";
import { Avatar, Box } from "@chakra-ui/react";
import { AxiosError } from "axios";

const ChatCard = ({ chat }: { chat: any }) => {
  const { selectedChat, setSelectedChat,setChats,user,isTyping } = useGlobalState();
  const { dark, socket } = useGlobalState();
  function formatTimestamp(timestamp: Date | string | number): string {
    if(!timestamp){
      return "";
    }
    const date: Date = new Date(timestamp);
    const now: Date = new Date();
    
    const diffMs: number = now.getTime() - date.getTime(); // Ensure number type
    const diffHours: number = diffMs / (1000 * 60 * 60);

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

  const setChat = async (id:string) => {
    try {
      if(socket){
      const { data } = await chats(id);
      if (data.success) {
        socket.emit("join_chat", data.chat?._id); // Emit event to server
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat?._id === id
              ? { ...chat, count:0}
              : chat
          )
        );
        console.log(data.chat);
        setSelectedChat(data.chat);

      }
    }
    } catch (err) {
      if (err instanceof AxiosError)
        toaster.create({
          title: err?.response?.data.message || "Error in login",
          description: "Try again",
          type: "error",
        });
    }
  };
  return (
    <>
      <div className="line" />

      <Box
        display={"flex"}
        minH={"75px"}
        justifyContent={"start"}
        padding={{ base: "5px 20px", md: "10px 20px" }}
        alignItems={"center"}
        gap={"20px"}
        cursor={"pointer"}
        background={
          dark
            ? selectedChat?._id === chat?._id
              ? "#2a3942"
              : "#111b21"
            : selectedChat?._id === chat?._id
            ? "#f0f2f5"
            : "#ffffff"
        }
        _hover={{
          background:
            selectedChat?._id === chat?._id ? "" : dark ? "#202c33" : "#f0f2f5",
        }}
        onClick={() => {
          setChat(chat?._id);
        }}
      >
        <Avatar.Root size={"lg"} bg={"blue"}>
          <Avatar.Fallback name={chat?.name} />
          <Avatar.Image
            src={
              chat?.image ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
            }
          />
        </Avatar.Root>
        <div className="textBox">
          <p
            style={{ fontSize: "16px", fontWeight: 400, padding: 0, margin: 0 }}
          >
            {chat?.name}
          </p>
          {(chat?.topMessage?.content) ? (
            <p
              style={{
                fontSize: "12px",
                padding: 0,
                margin: 0,
                color: "#667781",
                marginTop: "-2px",
              }}
            >
              {chat?.topMessage?.content}
            </p>
          ):""}
        </div>
        <div className="chatCardCorner">
        <div>
          <p className="cardTime" style={{color:"#c0c9ce"}}>{formatTimestamp(chat?.topMessage?.createdAt)}</p>
        </div>
        {( chat?.count > 0 && chat?.topMessage?.sender!==user?._id) && (
          <>
          <div className="notification">
            <p>{chat.count} </p>
          </div>
          </>
        )}
        </div>
      </Box>
    </>
  );
};

export default ChatCard;
