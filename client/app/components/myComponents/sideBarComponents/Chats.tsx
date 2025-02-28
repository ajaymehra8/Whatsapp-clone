"useClient";
import { Box, Button } from "@chakra-ui/react";
import { MdOutlineAddComment } from "react-icons/md";
import { SlOptionsVertical } from "react-icons/sl";
import SearchBar from "./SearchBar";
import { useEffect, useState,useRef } from "react";
import ChatCard from "./chatComponents/ChatCard";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { getAllChats } from "@/app/utils/api";
import { AxiosError } from "axios";
import { toaster } from "../../ui/toaster";
import { createChat } from "./utils/createChat";
import { useCallback } from "react";
import socket from "@/lib/socket";
import BottomOptions from "./chatComponents/BottomOptions";
import { ChatType } from "@/app/types/allTypes";

const Chats = () => {
  const [active, setActive] = useState("All");
  const { user, dark,fetchAgain,chats,setChats } = useGlobalState();
  const buttons = ["All", "Unread", "Groups"];
  const divRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>(0);
  const [noItemText, setNoItemText] = useState("No chats,yet.");

  useEffect(() => {
    if (!divRef.current) return;

    // ResizeObserver to track height changes
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    });

    observer.observe(divRef.current);

    return () => observer.disconnect(); // Cleanup on unmount
  }, []);
 


  const fetchChats = useCallback(async () => {
    
    if (user && chats.length<1)
      try {
        const { data } = await getAllChats();
        
        const chats = createChat(data.chats, user?._id);
        chats.sort((a:ChatType,b:ChatType)=>(
          (new Date(b.topMessage?.createdAt ?? 0).getTime()) -
          (new Date(a.topMessage?.createdAt ?? 0).getTime())
        ));
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
        minH={"17vh"}
        paddingTop={"15px"}
        zIndex={2}
        bg={dark ? "#111b21" : "#ffffff"}
        overflow={"hidden"}
        ref={divRef}
      >
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width={"100%"}
          padding={"0 15px"}
        >
          <h3 style={{ fontSize: "22px", fontWeight: 700,fontFamily:"'Fira Sans',sans-serif" }}>Chats</h3>
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
        marginTop={height+25+"px"}
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
      <BottomOptions/>
    </Box>
  );
};

export default Chats;
