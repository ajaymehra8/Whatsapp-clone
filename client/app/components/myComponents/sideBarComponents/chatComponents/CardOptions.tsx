import { toaster } from "@/app/components/ui/toaster";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { ChatType, UserType } from "@/app/types/allTypes";
import { leaveGroup, pinTheChat, unpinTheChat } from "@/app/utils/api";
import { Box } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React from "react";
import { createGroupChat } from "../utils/createChat";
interface Props {
  openOptionId: ChatType | null;
  setOpenOptionId: React.Dispatch<React.SetStateAction<ChatType | null>>;
}
const CardOptions: React.FC<Props> = ({ openOptionId, setOpenOptionId }) => {
  const { setShowPopup, setChats, dark, selectedChat, setSelectedChat, user } =
    useGlobalState();
  const exitGroup = async (e: React.MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    try {
      const { data } = await leaveGroup(openOptionId?._id);
      if (data.success) {
        console.log(data);
        const updatedChat = createGroupChat(data.chat);
        if (selectedChat?._id === openOptionId?._id) {
          setSelectedChat(updatedChat);
        }
        setChats((prevChat) =>
          prevChat.map((c) => {
            if (c._id === openOptionId?._id) {
              return updatedChat ? updatedChat : c;
            }
            return c;
          })
        );
        toaster.create({
          title: data?.message,
          description: "Enjoy",
          type: "success",
        });
        setOpenOptionId(null);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toaster.create({
          title: err?.response?.data?.message || "Problem in fetching chats",
          description: "Try again",
          type: "error",
        });
      }
    }
  };

  const pinChat = async (e: React.MouseEvent<HTMLLIElement>) => {
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
                new Date(b.topMessage?.createdAt ?? 0).getTime() -
                new Date(a.topMessage?.createdAt ?? 0).getTime()
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
      background={dark ? "#233138" : "#ffffff"}
      boxShadow={!dark ? "md" : "none"}
      transition={"all .5s"}
    >
      <ul className="option-ul">
        <li className="option-item" onClick={pinChat}>
          {openOptionId?.isPinned ? "Unpin" : "Pin"} chat
        </li>

        {!openOptionId?.isGroupedChat ? (
          <li
            className="option-item"
            onClick={(e) => {
              e.stopPropagation();
              if (openOptionId) {
                setShowPopup(openOptionId?._id);
              }
              setOpenOptionId(null);
            }}
          >
            Delete chat
          </li>
        ) : (
          openOptionId?.users?.some((u: UserType) => u._id === user?._id) && (
            <li className="option-item" onClick={exitGroup}>
              Leave group
            </li>
          )
        )}
      </ul>
    </Box>
  );
};

export default CardOptions;
