"use client";
import { Box, Flex } from "@chakra-ui/react";
import { IoSendSharp } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";
import { useState } from "react";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { doMessage, notifyUser } from "@/app/utils/api";
import { toaster } from "../../ui/toaster";
import { AxiosError } from "axios";
import { chatType } from "@/app/types/allTypes";
let typingTimeOut: NodeJS.Timeout | null = null;

const MessageInput = () => {
  const [message, setMessage] = useState<string>("");
  const { dark, selectedChat, socket, setChats, onlineUsers,setSelectedChat,isTyping,setIsTyping } =
    useGlobalState();
const handleMessageChange=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
  setMessage(e.target.value);
  if (!isTyping) {
    socket.emit("typing", selectedChat);
  }
  var timerLength = 1000;
  if(typingTimeOut){
    clearTimeout(typingTimeOut);
  }
  typingTimeOut=setTimeout(() => {
      socket.emit("stop_typing", selectedChat);
  }, timerLength);
};
  const sendMessage = async () => {
    try {
      const { data } = await doMessage(selectedChat._id, message);
      if(data.newChat){
        setSelectedChat(data.chat);
        socket.emit("new_chat",data.chat);
        socket.emit("join_chat", data.chat._id); // Emit event to server

      }else{
      setSelectedChat((prevChat:chatType)=>({...prevChat,messages:[...prevChat.messages,data.newMessage]}));
      }
      socket.emit("send_message", data.newMessage);
      if (!onlineUsers.includes(selectedChat.userId)) {
        await notifyUser(selectedChat._id);
      }
      // want to change from here
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, topMessage: data.newMessage }
            : chat
        )
      );
    } catch (err) {
      console.log(err);
      if (err instanceof AxiosError) {
        toaster.create({
          title: err?.response?.data?.message || "Error in doing message",
          description: "Try again",
          type: "error",
        });
      }
    } finally {
      setMessage("");
    }
  };

  return (
    <Flex
      height={"8vh"}
      background={dark ? "#202c33" : "#f0f2f5"}
      width={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={3}
    >
      <IoIosAdd
        size={"30px"}
        cursor={"pointer"}
        color={dark ? "#d1d7db" : "#3b4a54"}
      />

      <textarea
        style={{
          width: "87%",
          padding: "5px 10px",
          borderRadius: "10px",
          backgroundColor: dark ? "#2a3942" : "#ffffff",
          height: "75%",
          overflowY: "auto",
          overflowX: "hidden", // Prevent horizontal scrolling
          resize: "none", // Prevent resizing if needed
        }}
        value={message}
        onChange={handleMessageChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            // Call a function or handle the event
            sendMessage();
            setMessage("");
          }
        }}
        placeholder="Type a message"
        className="send-message-input"
      ></textarea>

      <IoSendSharp
        size={"20px"}
        cursor={"pointer"}
        color={dark ? "#d1d7db" : "#3b4a54"}
        onClick={sendMessage}
      />
    </Flex>
  );
};

export default MessageInput;
