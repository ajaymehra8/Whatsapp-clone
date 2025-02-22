"useClient";
import { Box, Button } from "@chakra-ui/react";
import { MdOutlineAddComment } from "react-icons/md";
import { SlOptionsVertical } from "react-icons/sl";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import ChatCard from "./chatComponents/ChatCard";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { getAllChats } from "@/app/utils/api";
import { AxiosError } from "axios";
import { toaster } from "../../ui/toaster";
import { createChat } from "./utils/createChat";
import { useCallback } from "react";
import socket from "@/lib/socket";
// types
interface ChatType {
  _id: string;
  name: string;
  latestMessage?: string;
}

const Chats = () => {
  const [active, setActive] = useState("All");
  const { user, dark,fetchAgain,chats,setChats } = useGlobalState();
  const buttons = ["All", "Unread", "Favorites", "Groups"];
 
  const [noItemText, setNoItemText] = useState("No chats,yet");


  const fetchChats = useCallback(async () => {
    
    if (user)
      try {
        const { data } = await getAllChats();
        
        const chats = createChat(data.chats, user._id);
        setChats(chats);
      } catch (err) {
        if (err instanceof AxiosError) {
          toaster.create({
            title: err?.response?.data?.message || "Problem in fetching chats",
            description: "Try again",
            type: "error",
          });
        }
      }
  }, [user,fetchAgain]);
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);
  return (
    <Box
      borderRight={dark ? "1px solid #222c33" : "1px solid #d1d7db"}
      width={{base:"100%",md:"95%"}}
      marginLeft={{base:"0",md:"14%"}}
      overflowY={"hidden"}
    >
      <Box
        position={"fixed"}
        top={"0"}
        width={{base:"100%",md:"30%"}}
        minH={"20vh"}
        paddingTop={"14px"}
        zIndex={2}
        bg={dark ? "#111b21" : "#ffffff"}
        overflow={"hidden"}
      >
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width={"100%"}
          padding={"0 10px"}
        >
          <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Chats</h3>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            width={"20%"}
            alignItems={"center"}
          >
            <MdOutlineAddComment
              size="20px"
              color={dark ? "#a5b1b8" : "#54656f"}
              cursor="pointer"
            />
            <SlOptionsVertical
              size="17px"
              color={dark ? "#a5b1b8" : "#54656f"}
              cursor="pointer"
            />
          </Box>
        </Box>
        <SearchBar setChats={setChats} setNoItemText={setNoItemText} />
        <Box
          width={"100%"}
          display={"flex"}
          justifyContent={"start"}
          gap={2}
          alignItems={"center"}
          paddingLeft={"14px"}
          marginTop={"10px"}
        >
          {buttons.map((text, ind) => (
            <button
              className={`roundedBtn ${
                active === text ? "roundedBtnActive" : ""
              }`}
              onClick={(e) => {
                setActive(text);
              }}
              key={ind}
            >
              {text}
            </button>
          ))}
        </Box>
      </Box>
      <Box
        width={"100%"}
        display={"flex"}
        flexDirection={"column"}
        marginTop={{base:"23vh",md:"25vh"}}
        height={"75vh"}
        overflowY={"auto"}
        bg={dark ? "#111b21" : ""}
      >
        {/* {
          searchChats.length>0 && (
            <Box position={"relative"}>
              <h1>Chats</h1>
              {searchChats.map((chat) => (
                <ChatCard chat={chat} key={chat?._id} />
              ))}
            </Box>
          )
        } */}
        {chats.length > 0 ? (
          <Box position={"relative"}>
            {chats.map((chat) => (
              <ChatCard chat={chat} key={chat?._id} />
            ))}
          </Box>
        ) : (
          <h1 className="no-item-text">{noItemText}</h1>
        )}
      </Box>
    </Box>
  );
};

export default Chats;
