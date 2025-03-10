import { Avatar, Box, Button } from "@chakra-ui/react";
import { Tooltip } from "../../ui/tooltip";
import { IoMdSettings } from "react-icons/io";

import { MdOutlineComment } from "react-icons/md";
import { useGlobalState } from "@/app/context/GlobalProvider";
const Options = () => {
  const { dark, user,setOption } = useGlobalState();

  return (
    <Box
      position={"fixed"}
      height={"100vh"}
      top={"0"}
      bottom={"0"}
      left={"0"}
      display={{ base: "none", md: "flex" }}
      flexDirection={"column"}
      alignItems={"center"}
      gap={"20px"}
      paddingTop={"15px"}
      width={"clamp(50px,5%,70px)"}
      background={dark ? "#202c33" : "#f0f2f5"}
      borderRight={dark ? "1px solid #2f3b43" : "1px solid #d1d7db"}
      zIndex={5}
    >
      <Tooltip content="Chats" positioning={{ placement: "right-end" }}>
        <Box as="span" onClick={()=>setOption("chats")}>
          <MdOutlineComment
            size="25px"
            color={dark ? "#aebac1" : "#54656f"}
            cursor="pointer"
          />
        </Box>
      </Tooltip>
      <Box
        marginTop={"auto"}
        paddingBottom={"15px"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        gap={"20px"}
      >
        <Tooltip content="Settings" positioning={{ placement: "right-end" }}>
          <Box as="span" onClick={()=>setOption("setting")}>
            <IoMdSettings
              size="25px"
              color={dark ? "#aebac1" : "#54656f"}
              cursor="pointer"
            />
          </Box>
        </Tooltip>

        <Tooltip content="Profile" positioning={{ placement: "right-end" }}>

        <Avatar.Root
          size={"xs"}
          bg={"blue"}
          cursor={"pointer"}
          style={{ width: "25px", height: "25px" }} // Customize size
          onClick={()=>setOption("profile")}
        >
          
          <Avatar.Fallback name={user?.name} />

          <Avatar.Image
            src={
              user?.image?.link ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
            }
          />

        </Avatar.Root>
</Tooltip>
      </Box>
    </Box>
  );
};

export default Options;
