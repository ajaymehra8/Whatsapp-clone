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
import MessagePopup from "./components/myComponents/SelectedChatComponent/MessagePopup";
import ChatHead from "./components/myComponents/SelectedChatComponent/ChatHead";
import { notifyUser } from "./utils/api";
import GroupDetails from "./components/myComponents/GroupChatComponents/GroupDetails";
// Define a theme (optional)

export default function Home() {
  const {
    selectedChat,
    socket,
    setChats,
    setSelectedChat,
    otherUserId,
    showGroup,
    showPopup,
    messagePopup,
  } = useGlobalState();
  const [messages, setMessages] = useState<Message[]>([]);

  const router = useRouter();
  const pathname = usePathname(); // Correct way in Next.js App Router
  const playSound = () => {
    const audio = new Audio("/sounds/notification.mp3"); // Ensure the file is in the `public/sounds` folder
    audio.play();
  };
  const handleMessageReceived = useCallback(
    async (newMessage: Message) => {
      if (selectedChat?._id === newMessage.chat?._id) {
        setSelectedChat((prevSelectedChat: ChatType | null) =>
          prevSelectedChat && prevSelectedChat?.messages
            ? {
                ...prevSelectedChat,

                messages: [...prevSelectedChat.messages, newMessage],
              }
            : null
        );
      } else {
        playSound();
        await notifyUser(newMessage?.chat?._id);

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
        const updatedChat = updatedChats.find(
          (chat) => chat?._id === newMessage.chat?._id
        );

        let pinnedChats = updatedChats.filter((chat) => chat.isPinned);
        const oldChats = updatedChats.filter(
          (c) => !c.isPinned && newMessage.chat._id !== c._id
        );
        let isPinned: boolean = false;
        if (!updatedChat) {
          return [...pinnedChats, ...oldChats];
        }

        if (pinnedChats.some((c) => c._id === updatedChat._id)) {
          isPinned = true;
          pinnedChats = pinnedChats.map((c) => {
            if (updatedChat?._id === c._id) {
              return updatedChat;
            }
            return c;
          });
        }
        if (isPinned) {
          return [...pinnedChats, ...oldChats];
        }
        return [...pinnedChats, updatedChat, ...oldChats];
      });
    },
    [selectedChat, socket]
  );
  useEffect(() => {
    if (socket) {
      const handleDeleteMessage = (message: Message) => {
        if (!selectedChat) {
          setChats((prevChats) => {
            return prevChats.map((chat) => {
              if (chat._id === message.chat?._id) {
                if (chat.topMessage._id === message?._id) {
                  return { ...chat, topMessage: message };
                } else {
                  return chat;
                }
              }
              return chat;
            });
          });
          return;
        } else {
          setSelectedChat((prevChats) => {
            if (!prevChats) return prevChats; // Ensure prevChats is not null

            const updatedMessages = prevChats.messages?.map((m) => {
              if (m._id === message?._id) {
                return message;
              }
              return m;
            });

            return { ...prevChats, messages: updatedMessages ?? [] };
          });
        }
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === message.chat?._id) {
              if (chat.topMessage._id === message?._id) {
                return { ...chat, topMessage: message };
              } else {
                return chat;
              }
            }
            return chat;
          });
        });
      };
      socket.on("message_received", handleMessageReceived);
      socket.on("message_deleted", handleDeleteMessage);
      // Cleanup function to remove the event listener

      return () => {
        socket.off("message_received", handleMessageReceived);
        socket.off("message_deleted", handleDeleteMessage);

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
      {showGroup && <GroupDetails />}

      {showPopup && <PopupInfo />}
      {messagePopup && <MessagePopup />}
    </FlexLayout>
  );
}
