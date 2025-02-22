"use client"
import { Box } from "@chakra-ui/react";
import Chats from "./sideBarComponents/Chats";
import Options from "./sideBarComponents/Options";
import { useGlobalState } from "@/app/context/GlobalProvider";

const SideBar = () => {
  const {dark,selectedChat}=useGlobalState();
  return (
    <Box
      display={{base:selectedChat?"none":"flex",md:"flex"}}
      width={{base:"100%",md:"35%"}}
      minH={"100vh"}
      overflow={"hidden"}

    >
      <Options />
      <Chats />
    </Box>
  );
};

export default SideBar;
