import { toaster } from "@/app/components/ui/toaster";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { ChatType, Message } from "@/app/types/allTypes";
import { pinTheChat, unpinTheChat } from "@/app/utils/api";
import { Box } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React from "react";
interface Props {
  messageOption: Message | null;
  setMessageOption: React.Dispatch<React.SetStateAction<Message | null>>;
}
const MessageCardOptions: React.FC<Props> = ({ messageOption, setMessageOption }) => {
  const { setShowPopup } = useGlobalState();
  
  return (
    <Box
      w={"clamp(100px,10vw,150px)"}
      position={"absolute"}
      p={"10px 0"}
      top={"10px"}
      zIndex={20}
      className="messageOption"
      background={"#233138"}
      transition={"all .5s"}
    >
      <ul className="option-ul">
  
        <li
          className="option-item"
          onClick={(e) => {
            e.stopPropagation();
            if (messageOption) setShowPopup(messageOption._id);
            setMessageOption(null);
          }}
        >
          Delete chat
        </li>
      </ul>
    </Box>
  );
};

export default MessageCardOptions;
