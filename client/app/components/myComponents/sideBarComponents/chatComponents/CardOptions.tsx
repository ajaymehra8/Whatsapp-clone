import { toaster } from "@/app/components/ui/toaster";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { ChatType } from "@/app/types/allTypes";
import { pinTheChat, unpinTheChat } from "@/app/utils/api";
import { Box } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React from "react";
interface Props {
  openOptionId: ChatType | null;
  setOpenOptionId: React.Dispatch<React.SetStateAction<ChatType | null>>;
}
const CardOptions: React.FC<Props> = ({ openOptionId, setOpenOptionId }) => {
  const { setShowPopup, setChats } = useGlobalState();
  console.log(openOptionId);
  const pinChat = async (e:React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    try {
      if (!openOptionId?.isPinned) {
        const { data } = await pinTheChat(openOptionId?._id);
        if (data.success) {
          setOpenOptionId(null);
          setChats((prevChats) => {
            let pinnedChat: (typeof prevChats)[number] | undefined; // Ensure correct type

            const updatedChats = prevChats.filter((chat) => {
              if (chat._id === data.chat._id) {
                pinnedChat = { ...chat, isPinned: true };
                return false; // Remove this chat from the updatedChats list
              }
              return true;
            });

            return pinnedChat ? [pinnedChat, ...updatedChats] : updatedChats;
          });
        }
      } else {
        console.log("work");
        console.log(openOptionId);
        const { data } = await unpinTheChat(openOptionId?._id);
        if (data.success) {
          setOpenOptionId(null);
          setChats((prevChats) => {
            let pinnedChat: (typeof prevChats)[number] | undefined; // Ensure correct type
          
            const updatedChats = prevChats.filter((chat) => {
              if (chat._id === data.chat._id) {
                pinnedChat = { ...chat, isPinned: false };
                return false; // Remove this chat from the updatedChats list
              }
              return true;
            });
          
            // Add back the unpinned chat and then sort
            if (pinnedChat) updatedChats.push(pinnedChat);
          
            return updatedChats.sort((a, b) => {
              // Move pinned chats to the top
              if (a.isPinned !== b.isPinned) {
                return a.isPinned ? -1 : 1; // Pinned first
              }
          
              // Sort by latest topMessage.createdAt
              return (
                (new Date(b.topMessage?.createdAt ?? 0).getTime()) -
                (new Date(a.topMessage?.createdAt ?? 0).getTime())
              );
            });
          });
          
        }
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toaster.create({
          title: err.response?.data.message,
          description: "Try again",
          type: "error",
        });
      }
    }
  };
  return (
    <Box
      w={"40%"}
      position={"absolute"}
      p={"10px 0"}
      right={"3%"}
      bottom={"-70px"}
      zIndex={10}
      background={"#233138"}
      transition={"all .5s"}
    >
      <ul className="option-ul">
        <li className="option-item" onClick={pinChat}>
          {openOptionId?.isPinned ? "Unpin" : "Pin"} chat
        </li>
        <li
          className="option-item"
          onClick={(e) => {
            e.stopPropagation();
            if (openOptionId) setShowPopup(openOptionId._id);
            setOpenOptionId(null);
          }}
        >
          Delete chat
        </li>
      </ul>
    </Box>
  );
};

export default CardOptions;
