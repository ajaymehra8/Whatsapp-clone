import { toaster } from "@/app/components/ui/toaster";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { ChatType, UserType } from "@/app/types/allTypes";
import {
  chats,
  pinTheChat,
  removeMemberAPI,
  unpinTheChat,
} from "@/app/utils/api";
import { Box } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React from "react";
import { createGroupChat } from "../../sideBarComponents/utils/createChat";
interface Props {
  member: UserType | null;
  setMember: React.Dispatch<React.SetStateAction<UserType | null>>;
  setGroupMembers: React.Dispatch<React.SetStateAction<UserType[]>>;
}
const MemberOptions: React.FC<Props> = ({
  member,
  setMember,
  setGroupMembers,
}) => {
  const {
    dark,
    showGroup,
    user,
    setShowGroup,
    socket,
    setChats,
    setOtherUserId,
    setSelectedChat,
    selectedChat,
  } = useGlobalState();

  const removeMember = async () => {
    try {
      const { data } = await removeMemberAPI(showGroup?._id, member?._id);
      if (data.success) {
        const updatedChat = createGroupChat(data.chat);
        setShowGroup(updatedChat);
        if (updatedChat?.users) setGroupMembers(updatedChat?.users);
        if (selectedChat?._id === showGroup?._id) {
          setSelectedChat(updatedChat);
        }
        toaster.create({
          title: data?.message,
          description: "Enjoy",
          type: "success",
        });
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

  return (
    <Box
      w={"40%"}
      position={"absolute"}
      p={"10px 0"}
      right={"3%"}
      bottom={user?._id === showGroup?.groupAdmin ? "-70px" : "-35px"}
      zIndex={10}
      background={dark ? "#233138" : "#ffffff"}
      boxShadow={!dark ? "md" : "none"}
      transition={"all .5s"}
    >
      <ul className="option-ul">
        {user?._id !== member?._id && (
          <li className="option-item" onClick={() => setChat(member?._id)}>
            Message
          </li>
        )}
        {user?._id === showGroup?.groupAdmin && (
          <li className="option-item" onClick={removeMember}>
            Remove
          </li>
        )}{" "}
      </ul>
    </Box>
  );
};

export default MemberOptions;
