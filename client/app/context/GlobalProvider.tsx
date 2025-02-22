"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Socket } from "socket.io-client";
import getSocket from "@/lib/socket";

interface ChatType {
  _id: string;
  name: string;
  latestMessage?: string;
  userId?: string;
  count:number;
}
// Define the shape of the context
interface GlobalContextType {
  selectedChat: any;
  setSelectedChat: React.Dispatch<React.SetStateAction<any>>;
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  token: any;
  setToken: React.Dispatch<React.SetStateAction<any>>;
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
  socket: typeof Socket; // Define socket in the context
  onlineUsers: string[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
  isTyping:boolean;
  setIsTyping:React.Dispatch<React.SetStateAction<boolean>>;
}

// Create context with a default value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider component
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChat, setSelectedChat] = useState<any>(null); // Example global state
  const [dark, setDark] = useState<boolean>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [chats, setChats] = useState<ChatType[]>([]);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [online, setOnline] = useState<boolean>(false);
  const [token, setToken] = useState<any>(null);
  const [fetchAgain, setFetchAgain] = useState<boolean>(false);
const [isTyping,setIsTyping]=useState<boolean>(false);
  const socket = getSocket(); // Initialize socket

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
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

  // Emit "setup" event when the user is available and socket is ready
  useEffect(() => {
    if (user && socket) {
      socket.emit("setup", user);
      const handleOnlineUsers = (users: string[]) => {
        setOnlineUsers(users);
      };
      const handleStatusChanged = (data: {
        userId: string;
        lastSeen: string;
      }) => {
        if(selectedChat.userId===data.userId){
          console.log(selectedChat);
        setSelectedChat((prevSelectedChat)=>({...prevSelectedChat,lastSeen:data.lastSeen}));
        }
      };        
      const handleNewChat=(chat)=>{
        setChats((prevChats)=>([chat,...prevChats]));
      }
      socket.on("update_users", handleOnlineUsers);
      socket.on("user_status_changed", handleStatusChanged);
      socket.on("new_chat",handleNewChat);
      // Clean up the socket event listener
      return () => {
        socket.off("setup");
        socket.off("update_users", handleOnlineUsers);
        socket.off("user_status_changed", handleStatusChanged);
        socket.off("new_chat",handleNewChat);

      };
    }
  }, [user, socket,selectedChat]); // Depend on user and socket for emitting the event

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
        setIsTyping
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
