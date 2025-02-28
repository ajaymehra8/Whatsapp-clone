"use client";
import FlexLayout from "./auth/components/FlexLayout";
import SideBar from "./components/myComponents/SideBar";
import SelectedChat from "./components/myComponents/SelectedChat";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, redirect } from "next/navigation";
import { useGlobalState } from "./context/GlobalProvider";

import { ChatType, Message } from "./types/allTypes";
import UserDetails from "./components/myComponents/otherUserDetails/UserDetails";
import PopupInfo from "./components/myComponents/PopupInfo";
// Define a theme (optional)


export default function Home() {
  const { selectedChat, socket, setChats, setSelectedChat, otherUserId ,showPopup} = useGlobalState();
  const [messages, setMessages] = useState<Message[]>([]);

  const router = useRouter();
  const pathname = usePathname(); // Correct way in Next.js App Router
  const playSound = () => {
    console.log("sound");
    const audio = new Audio("/sounds/notification.mp3"); // Ensure the file is in the `public/sounds` folder
    audio.play();
  };
  const handleMessageReceived = useCallback(
    async (newMessage: Message) => {
      console.log(newMessage.sender, selectedChat);
      if (selectedChat && newMessage.sender === selectedChat.userId) {
        setSelectedChat((prevSelectedChat: ChatType | null) => (
          prevSelectedChat ? {
            ...prevSelectedChat,
            messages: [...prevSelectedChat.messages, newMessage],
          } : null));
        console.log(selectedChat);
      } else {
        playSound();
        setChats((prevChats) =>
          prevChats.map((chat) => {
            const newCount = chat.count + 1;

            return chat?._id === newMessage?.chat?._id
              ? { ...chat, count: newCount }
              : chat;
          })
        );
      }
      setChats((prevChats: ChatType[]) => {
        const updatedChats = prevChats.map((chat) =>
          chat?._id === newMessage.chat?._id
            ? { ...chat, topMessage: newMessage }
            : chat
        );

        // Find the updated chat and ensure it's not undefined
        const updatedChat = updatedChats.find((chat) => chat?._id === newMessage.chat?._id);

        // If updatedChat is found, move it to the front; otherwise, return the original updatedChats
        return updatedChat ? [updatedChat, ...updatedChats.filter((chat) => chat?._id !== newMessage.chat?._id)] : updatedChats;
      });

    },
    [selectedChat, socket]
  );
  useEffect(() => {
    if (socket) {
      socket.on("message_received", handleMessageReceived);
      // Cleanup function to remove the event listener

      return () => {
        socket.off("message_received", handleMessageReceived);
        console.log("useEffect cleanup - socket listener removed");
      };
    }
  }, [handleMessageReceived]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      redirect("/auth/login");
    } else if (pathname === "/auth/login" || pathname === "/auth/signup") {
      router.replace("/");
    }
  }, []);

  return (
    <FlexLayout>
      <SideBar />
      <SelectedChat messages={messages} setMessages={setMessages} />
      {otherUserId && <UserDetails />}
{      showPopup&&<PopupInfo />
}
    </FlexLayout>
  );
}
