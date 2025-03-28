"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Avatar, Box } from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { AxiosError } from "axios";
import { toaster } from "@/app/components/ui/toaster";
import { FaBan } from "react-icons/fa6";
import { IoIosArrowRoundBack } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { chats, getUser } from "@/app/utils/api";
import { UserType } from "@/app/types/allTypes";

interface PropType {
  option?: string;
}
const UserDetails: React.FC<PropType> = () => {
  const {
    dark,
    otherUserId,
    setOtherUserId,
    setShowPopup,
    selectedChat,
    setShowGroup,
    setChats,
    socket,
    setSelectedChat,
  } = useGlobalState();
  const [user, setUser] = useState<UserType | null>(null);
  // useEffect(() => {
  //   if (selectedChat?.userId !== otherUserId) {
  //     setOtherUserId("");
  //   }
  // }, [selectedChat]);

  const setChat = async (id: string | undefined) => {
    if (!id) {
      return;
    }
    try {
      if (socket) {
        const { data } = await chats(id);
        if (data.success) {
          socket.emit("join_chat", data.chat?._id); // Emit event to server
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat?._id === id ? { ...chat, count: 0 } : chat
            )
          );
          setOtherUserId("");
          setShowGroup(null);
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

  const fetchUserDetails = useCallback(async () => {
    try {
      if (!otherUserId) {
        toaster.create({
          title: "Please select a user",
          description: "Try again",
        });
        return;
      }
      const { data } = await getUser(otherUserId);
      if (data.success) {
        setUser(data?.user);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toaster.create({
          title: err.response?.data.message,
          description: "Try again",
        });
      }
    }
  }, [otherUserId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);
  return (
    <Box
      borderLeft={dark ? "1px solid #222d34" : "1px solid #d1d7db"}
      background={dark ? "#0c1317" : "#d1d7db"}
      minH={"100vh"}
      width={{ base: "100%", md: "30%" }}
      overflowY={"hidden"}
      zIndex={100}
      display={"flex"}
      flexDirection={"column"}
      gap={"10px"}
    >
      <Box
        width={{ base: "100%", md: "100%" }}
        minH={"3vh"}
        paddingTop={"15px"}
        background={dark ? "#111b21" : "#ffffff"}
        overflow={"hidden"}
        paddingBottom={"15px"}
      >
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
          width={"100%"}
          padding={"0 10px"}
        >
          <IoIosArrowRoundBack
            cursor={"pointer"}
            size={"clamp(30px,3vw,40px)"}
            style={{ marginRight: "5px" }}
            onClick={() => setOtherUserId("")}
          />

          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "1px",
              fontFamily: "'Fira Sans', sans-serif",
            }}
          >
            User info
          </h3>
        </Box>
        <Box
          display={"flex"}
          flexDir={"column"}
          alignItems={"center"}
          justifyContent={"center"}
          gap={"5px"}
          marginTop={"30px"}
        >
          <div
            className="profMain"
            style={{
              position: "relative",
              width: "fit-content", // To ensure the div wraps around the avatar
            }}
          >
            <Avatar.Root
              size={"lg"}
              cursor={"pointer"}
              width={{
                base: "clamp(30px,80vw,195px)",
                md: "clamp(30px,18vw,195px)",
              }}
              height={{
                base: "clamp(30px,80vw,195px)",
                md: "clamp(30px,18vw,195px)",
              }}
              // Customize size
            >
              <Avatar.Fallback name={user?.name} />

              <Avatar.Image
                src={
                  user?.image?.visibility
                    ? user?.image?.link
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
                }
              />
            </Avatar.Root>
          </div>
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDir={"column"}
          >
            <h3 style={{ letterSpacing: "2px" }}>{user?.name}</h3>
            <p style={{ color: "#667781" }}>{user?.email}</p>
          </Box>
        </Box>
      </Box>

      {user?.about?.visibility && (
        <Box
          width={{ base: "100%", md: "100%" }}
          minH={"3vh"}
          paddingTop={"15px"}
          background={dark ? "#111b21" : "#ffffff"}
          overflow={"hidden"}
          paddingBottom={"15px"}
          display={"flex"}
          alignItems={"flex-start"}
          justifyContent={"center"}
          flexDirection={"column"}
          gap={"5px"}
          lineHeight={1.2}
          paddingLeft={"9%"}
        >
          <h4 style={{ color: "#8696a0" }}>About</h4>
          <p>{user?.about?.content}</p>
        </Box>
      )}

      <Box
        width={{ base: "100%", md: "100%" }}
        minH={"3vh"}
        paddingTop={"15px"}
        background={dark ? "#111b21" : "#ffffff"}
        overflow={"hidden"}
        paddingBottom={"15px"}
        display={"flex"}
        alignItems={"flex-start"}
        justifyContent={"center"}
        flexDirection={"column"}
        gap={"5px"}
      >
        {!selectedChat?.isGroupedChat ? (
          <>
            <Box
              display={"flex"}
              minH={"45px"}
              width={"100%"}
              padding={{ base: "5px 20px", md: "0 40px" }}
              alignItems={"center"}
              gap={"25px"}
              cursor={"pointer"}
              background={dark ? "#111b21" : "#ffffff"}
              _hover={{
                background: dark ? "#202c33" : "#f0f2f5",
              }}
              letterSpacing={"1px"}
              color={dark ? "#ac4855" : "#ef426c"}
            >
              <FaBan size={"17px"} />

              <p style={{ fontSize: "17px" }}>Block {user?.name}</p>
            </Box>

            <Box
              display={"flex"}
              minH={"45px"}
              width={"100%"}
              padding={{ base: "5px 20px", md: "0 40px" }}
              alignItems={"center"}
              gap={"25px"}
              cursor={"pointer"}
              background={dark ? "#111b21" : "#ffffff"}
              _hover={{
                background: dark ? "#202c33" : "#f0f2f5",
              }}
              letterSpacing={"1px"}
              color={dark ? "#ac4855" : "#ef426c"}
              onClick={(e) => {
                e.stopPropagation();
                setOtherUserId("");
                if (selectedChat?._id) setShowPopup(selectedChat?._id);
              }}
            >
              <RiDeleteBin6Line size={"17px"} />

              <p style={{ fontSize: "17px" }}>Delete chat</p>
            </Box>
          </>
        ) : (
          <Box
            display={"flex"}
            minH={"45px"}
            width={"100%"}
            padding={{ base: "5px 20px", md: "0 40px" }}
            alignItems={"center"}
            gap={"25px"}
            cursor={"pointer"}
            background={dark ? "#111b21" : "#ffffff"}
            _hover={{
              background: dark ? "#202c33" : "#f0f2f5",
            }}
            letterSpacing={"1px"}
            onClick={(e) => {
              e.stopPropagation();
              setChat(otherUserId);
            }}
          >
            Message
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserDetails;
