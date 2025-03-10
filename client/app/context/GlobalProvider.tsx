"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { Socket } from "socket.io-client";
import getSocket from "@/lib/socket";
import { ChatType, Message } from "../types/allTypes";

// Define the shape of the context

interface GlobalContextType {
  selectedChat: ChatType | null;
  setSelectedChat: React.Dispatch<React.SetStateAction<ChatType | null>>;
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  token: any;
  setToken: React.Dispatch<React.SetStateAction<any>>;
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
  socket: typeof Socket | null; // Define socket in the context
  onlineUsers: string[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
  isTyping: ChatType | null;
  setIsTyping: React.Dispatch<React.SetStateAction<ChatType | null>>;
  option: string;
  setOption: React.Dispatch<React.SetStateAction<string>>;
  otherUserId: string;
  setOtherUserId: React.Dispatch<React.SetStateAction<string>>;
  showPopup: string;
  setShowPopup: React.Dispatch<React.SetStateAction<string>>;
  messagePopup: Message | null;
  setMessagePopup: React.Dispatch<React.SetStateAction<Message | null>>;
}

// Create context with a default value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider component
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null); // Example global state
  const [option, setOption] = useState<string>("chats");
  const [chats, setChats] = useState<ChatType[]>([]);
  const [dark, setDark] = useState<boolean>(false);
  const [otherUserId, setOtherUserId] = useState<string>("");
  const [showPopup, setShowPopup] = useState<string>("");
  const [messagePopup, setMessagePopup] = useState<Message | null>(null);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  //   }
  // }, []);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<any>(null);
  const [fetchAgain, setFetchAgain] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<ChatType | null>(null);
  const socket = getSocket(); // Initialize socket

  // Listen for system theme changes
  const handleChange = () => {
    if (localStorage.getItem("theme")) {
      const value = localStorage.getItem("theme");
      if (value === "dark") {
        setDark(true);
      } else {
        setDark(false);
      }
    }
  };
  useEffect(() => {
    handleChange();
  }, []);

  const fetchUserDetails = async () => {
    let user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) {
      setUser(null);
      setToken(null);
      return;
    }
    if (user) {
      user = JSON.parse(user);
    }

    setUser(user);
    setToken(token);
  };

  // Effect to fetch user details and set up socket
  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (dark) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
    document.body.classList.toggle("dark", dark);
    document.body.classList.toggle("light", !dark);
  }, [dark]);

  // Emit "setup" event when the user is available and socket is ready
  useEffect(() => {
    if (user && socket) {
      if (!socket.connected) socket.connect();
      socket.emit("setup", user);
      const handleOnlineUsers = (users: string[]) => {
        setOnlineUsers(users);
      };
      const handleStatusChanged = (data: {
        userId: string;
        lastSeen: string;
      }) => {
        if (selectedChat?.userId === data.userId) {
          console.log(selectedChat);
          setSelectedChat((prevSelectedChat: ChatType | null) =>
            prevSelectedChat
              ? {
                  ...prevSelectedChat,
                  lastSeen: {
                    ...prevSelectedChat.lastSeen,
                    time: data.lastSeen,
                  },
                }
              : null
          );
        }
      };
      const handleNewChat = (chat: ChatType) => {
        setChats((prevChats) => {
          let pinnedChats = prevChats.filter((chat) => chat.isPinned);
          const oldChats = prevChats.filter(
            (c) => !c.isPinned && chat._id !== c._id
          );
          let isPinned: boolean = false;
          if (pinnedChats.some((c) => c._id === chat._id)) {
            isPinned = true;
            pinnedChats = pinnedChats.map((c) => {
              if (chat._id === c._id) {
                return chat;
              }
              return c;
            });
          }
          if (isPinned) {
            return [...pinnedChats, ...oldChats];
          }
          return [...pinnedChats, chat, ...oldChats];
        });
      };
      socket.on("update_users", handleOnlineUsers);
      socket.on("user_status_changed", handleStatusChanged);
      socket.on("new_chat", handleNewChat);
      // Clean up the socket event listener
      return () => {
        socket.off("setup");
        socket.off("update_users", handleOnlineUsers);
        socket.off("user_status_changed", handleStatusChanged);
        socket.off("new_chat", handleNewChat);
      };
    }
  }, [user, socket, selectedChat]); // Depend on user and socket for emitting the event

  return (
    <GlobalContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        dark,
        setDark,
        user,
        setUser,
        token,
        setToken,
        fetchAgain,
        setFetchAgain,
        socket,
        onlineUsers,
        setOnlineUsers,
        chats,
        setChats,
        isTyping,
        setIsTyping,
        option,
        setOption,
        otherUserId,
        setOtherUserId,
        showPopup,
        setShowPopup,
        messagePopup,
        setMessagePopup,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use context
export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalProvider");
  }
  return context;
};
