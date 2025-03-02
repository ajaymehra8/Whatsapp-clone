"useClient";
import { Box, Button, Avatar } from "@chakra-ui/react";
import { SlOptionsVertical } from "react-icons/sl";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { CgProfile } from "react-icons/cg";
import { FaLock } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";

import { MdOutlineComment } from "react-icons/md";
import SettingCard from "./settingComonent/SettingCard";
import { useRouter } from "next/navigation";

const Setting = () => {
  const { user, dark, setUser, setToken, setSelectedChat, setOption, socket, setChats, setOnlineUsers } =
    useGlobalState();
  const router = useRouter();
  const settings = [
    {
      id: 1,
      name: "Account",
      icon: CgProfile,
    },
    {
      id: 2,
      name: "Privacy",
      icon: FaLock,
    },
    {
      id: 3,
      name: "Chats",
      icon: MdOutlineComment,
    },
  ];
  return (
    <Box
      borderRight={dark ? "1px solid #222c33" : "1px solid #d1d7db"}
      width={{ base: "100%", md: "95%" }}
      marginLeft={{ base: "0", md: "14%" }}
      overflowY={"hidden"}
    >
      <Box
        position={"fixed"}
        top={"0"}
        width={{ base: "100%", md: "30%" }}
        minH={"5vh"}
        paddingTop={"15px"}
        zIndex={2}
        bg={dark ? "#111b21" : "#ffffff"}
        overflow={"hidden"}
      >
        <Box
          display={"flex"}
          justifyContent={"start"}
          alignItems={'center'}
          width={"100%"}
          padding={"0 10px"}
        >
          <IoIosArrowRoundBack cursor={"pointer"} size={'clamp(30px,3vw,40px)'} style={{marginRight:"5px"}} onClick={()=>{setOption("chats")}}/>
          
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "1px",
              fontFamily: "'Fira Sans', sans-serif",
            }}
          >
            Settings
          </h3>
        </Box>
      </Box>
      <Box
        width={"100%"}
        display={"flex"}
        flexDirection={"column"}
        marginTop={"7vh"}
        height={"75vh"}
        overflowY={"auto"}
        bg={dark ? "#111b21" : ""}
      >
        <Box
          display={"flex"}
          minH={"45px"}
          justifyContent={"start"}
          marginTop={"20px"}
          marginBottom={"10px"}
          padding={{ base: "5px 20px", md: "10px 20px" }}
          alignItems={"center"}
          gap={"5%"}
          cursor={"pointer"}
          _hover={{
            background: dark ? "#202c33" : "#f0f2f5",
          }}
          onClick={() => { setOption("profile") }}
        >
          <Avatar.Root
            size={"lg"}
            cursor={"pointer"}
          
              width={{sm:"clamp(80px,80vw,85px)",md:"clamp(30px,10vw,85px)"}}
              height={{sm:"clamp(80px,80vw,85px)",md:"clamp(30px,10vw,85px)"}}
          >
            <Avatar.Fallback name={user?.name} />

            <Avatar.Image
              src={
                user?.image?.link ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
              }
            />
          </Avatar.Root>
          {user?.name}
        </Box>
        <Box position={"relative"}>
          {settings.map((setting) => {
            return <SettingCard key={setting.id} setting={setting} />;
          })}
          <Box
            display={"flex"}
            minH={"75px"}
            justifyContent={"start"}
            padding={{ base: "5px 20px", md: "10px 20px" }}
            alignItems={"center"}
            gap={"8%"}
            cursor={"pointer"}
            _hover={{
              background: dark ? "#202c33" : "#f0f2f5",
            }}
            onClick={() => {
              if(socket)
              socket.disconnect();

              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
              setToken(null);

              setSelectedChat(null);
              setChats([]);
              setOnlineUsers([]);
              setOption("chats");

              router.push("/auth/login");

            }}
          >
            <IoMdExit size={"20px"} style={{ color: "#f15c6d" }} />

            <p style={{ color: "#f15c6d" }}>Logout</p>
          </Box>
          <div className="line" style={{ width: "85%" }} />
        </Box>
      </Box>
    </Box>
  );
};

export default Setting;
