"use client";
import { Box } from "@chakra-ui/react";
import Chats from "./sideBarComponents/Chats";
import Options from "./sideBarComponents/Options";
import { useGlobalState } from "@/app/context/GlobalProvider";
import Setting from "./sideBarComponents/optionPages/Setting";
import Profile from "./sideBarComponents/optionPages/Profile";
import SettingPage from "./sideBarComponents/optionPages/settingComonent/SettingPage";

const SideBar = () => {
  const { selectedChat, option, user } = useGlobalState();
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      width={{ base: "100%", md: "35%" }}
      minH={"100vh"}
      overflow={"hidden"}
    >
      <Options />
      {option === "chats" && <Chats />}
      {option === "profile" && <Profile option="chats" />}

      {option === "setting" && <Setting />}
      {option === "privacy" && <SettingPage details={{ heading: "Privacy" }} />}
      
    </Box>
  );
};

export default SideBar;
