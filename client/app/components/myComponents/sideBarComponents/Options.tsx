import { Box, Button} from "@chakra-ui/react";
import { Tooltip } from "../../ui/tooltip";

import { MdComment, MdOutlineComment } from "react-icons/md";
import { useGlobalState } from "@/app/context/GlobalProvider";
const Options = () => {
    const {dark}=useGlobalState();
  
  return (
    <Box
      position={"fixed"}
      height={"100vh"}
      top={"0"}
      bottom={"0"}
      left={"0"}
      display={{base:"none",md:"flex"}}
      flexDirection={"column"}
      alignItems={"center"}
      gap={"20px"}
      paddingTop={"15px"}
      width={"clamp(50px,5%,70px)"}
      background={dark?"#202c33":"#f0f2f5"}
      borderRight={dark?"1px solid #2f3b43":"1px solid #d1d7db"}
      zIndex={5}
    >
        <Tooltip content="Chats"  positioning={{ placement: "right-end" }}
        > 
        <Box as="span">
          <MdOutlineComment size="20px" color={dark?"#aebac1":"#54656f"} cursor="pointer" />
        </Box>
      </Tooltip>

    </Box>
  );
};

export default Options;
