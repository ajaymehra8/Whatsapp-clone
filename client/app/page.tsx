"use client";
import { Box, Button } from "@chakra-ui/react";
import { toaster } from "./components/ui/toaster";
import FlexLayout from "./auth/components/FlexLayout";
import SideBar from "./components/myComponents/SideBar";
import SelectedChat from "./components/myComponents/SelectedChat";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalState } from "./context/GlobalProvider";
import { SlControlPause } from "react-icons/sl";
import { notifyUser } from "./utils/api";
import { ChatType, Message } from "./types/allTypes";
// Define a theme (optional)


export default function Home() {
  const { selectedChat, socket, setChats, setSelectedChat } = useGlobalState();
  const [messages, setMessages] = useState<Message[]>([]);

  const router = useRouter();
  const pathname = usePathname(); // Correct way in Next.js App Router
  const playSound = () => {
    console.log("sound");
    const audio = new Audio("/sounds/notification.mp3"); // Ensure the file is in the `public/sounds` folder
    audio.play();
  };
  const handleMessageReceived = useCallback(
    async (newMessage:Message) => {
      console.log(newMessage.sender, selectedChat);
      if (selectedChat && newMessage.sender=== selectedChat.userId) {
        setSelectedChat((prevSelectedChat:ChatType|null) => (
          prevSelectedChat?{
          ...prevSelectedChat,
          messages: [...prevSelectedChat.messages, newMessage],
        }:null));
        console.log(selectedChat);
      } else {
        playSound();
        setChats((prevChats) =>
          prevChats.map((chat) => {
            const newCount = chat.count + 1;

            return chat._id === newMessage.chat._id
              ? { ...chat, count: newCount }
              : chat;
          })
        );
      }
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === newMessage.chat._id
            ? { ...chat, topMessage: newMessage }
            : chat
        )
      );
    },
    [selectedChat, socket]
  );
  useEffect(() => {
    socket.on("message_received", handleMessageReceived);
    // Cleanup function to remove the event listener

    return () => {
      socket.off("message_received", handleMessageReceived);
      console.log("useEffect cleanup - socket listener removed");
    };
  }, [handleMessageReceived]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
    } else if (pathname === "/auth/login" || pathname === "/auth/signup") {
      router.replace("/");
    }
  }, []);

  return (
    <FlexLayout>
      <SideBar />
      <SelectedChat messages={messages} setMessages={setMessages} />
    </FlexLayout>
  );
}
