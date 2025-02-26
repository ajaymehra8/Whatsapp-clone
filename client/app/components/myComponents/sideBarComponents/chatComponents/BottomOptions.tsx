import { Avatar, Box, Button } from "@chakra-ui/react";
import { Tooltip } from "../../../ui/tooltip";
import { IoMdSettings } from "react-icons/io";

import { MdOutlineComment } from "react-icons/md";
import { useGlobalState } from "@/app/context/GlobalProvider";
const BottomOptions = () => {
  const { dark, user, setOption } = useGlobalState();

  return (
    <Box
      position={"fixed"}
      height={"6vh"}
      bottom={"0"}
      left={"0"}
      display={{base:"flex",md:"none"}}
      alignItems={"center"}
      justifyContent={'space-evenly'}
      gap={"7vw"}
      width={"100%"}
      background={dark ? "#202c33" : "#f0f2f5"}
      borderRight={dark ? "1px solid #2f3b43" : "1px solid #d1d7db"}
      zIndex={5}
    >
      <Tooltip content="Chats" positioning={{ placement: "right-end" }}>
        <Box as="span" onClick={() => setOption("chats")}>
          <MdOutlineComment
            size="25px"
            color={dark ? "#aebac1" : "#54656f"}
            cursor="pointer"
          />
        </Box>
      </Tooltip>

      <Tooltip content="Settings" positioning={{ placement: "right-end" }}>
        <Box as="span" onClick={() => setOption("setting")}>
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
          onClick={() => setOption("profile")}
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
  );
};

export default BottomOptions;
