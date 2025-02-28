"use client";
import { Box, Flex } from "@chakra-ui/react";
import { IoSendSharp } from "react-icons/io5";
import { IoIosAdd } from "react-icons/io";
import { useState,useEffect,useRef } from "react";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { doMessage, notifyUser } from "@/app/utils/api";
import { toaster } from "../../ui/toaster";
import { AxiosError } from "axios";
import { ChatType } from "@/app/types/allTypes";
let typingTimeOut: NodeJS.Timeout | null = null;

const MessageInput = () => {
  const [message, setMessage] = useState<string>("");
  const { dark, selectedChat, socket, setChats, onlineUsers,setSelectedChat,isTyping,setIsTyping } =
    useGlobalState();
    // const textareaRef = useRef<HTMLTextAreaElement>(null);
    // const mainBoxRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //   if (textareaRef.current) {
    //     textareaRef.current.style.height = "5.4vh"; // Reset height
    //     textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Adjust to content
    //     if(mainBoxRef.current)
    //     mainBoxRef.current.style.height = `${textareaRef.current.scrollHeight+10}px`; // Adjust to content

    //   }
    // }, [message]);


const handleMessageChange=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
  if(socket){
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
}
};
  const sendMessage = async () => {
    if(socket){
    try {
      if(!selectedChat) return;
      const { data } = await doMessage(selectedChat?._id, message);
      
      if(data.newChat){
        setSelectedChat(data.chat);
        socket.emit("new_chat",data.chat);
        socket.emit("join_chat", data.chat?._id); // Emit event to server

      }else{
      setSelectedChat((prevChat:ChatType|null)=>(
       prevChat? {...prevChat,messages:[...prevChat.messages,data.newMessage]}:null
      ));
      }
      socket.emit("send_message", data.newMessage);
      if(selectedChat){
        await notifyUser(selectedChat?._id);
    }
      // want to change from here
      setChats((prevChats: ChatType[]) => {
        if (!selectedChat) return prevChats; // Ensure selectedChat is defined
      
        // Update the chat with new topMessage
        const updatedChats = prevChats.map((chat) =>
          chat._id === selectedChat._id ? { ...chat, topMessage: data.newMessage } : chat
        );
      
        // Find the updated chat
        const updatedChat = updatedChats.find((chat) => chat._id === selectedChat._id);
      
        // Move updated chat to the front if found
        return updatedChat
          ? [updatedChat, ...updatedChats.filter((chat) => chat._id !== selectedChat._id)]
          : updatedChats;
      });
      
      
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
  }
  };

  return (
    <Flex
      minHeight={"8vh"}
      maxHeight={'24vh'}
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
          maxHeight:'20vh',
          height:'5.4vh',
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
