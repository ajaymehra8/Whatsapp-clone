import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box, Text } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React from "react";
import { deleteForEveryone, deleteForMe } from "@/app/utils/api";
import { toaster } from "../../ui/toaster";

const MessagePopup = () => {
  const {
    messagePopup,
    setSelectedChat,
    selectedChat,
    setMessagePopup,
    dark,
    user,
    socket,
    setChats,
  } = useGlobalState();

  const handleDeleteForMe = async () => {
    try {
      const messageId = messagePopup?._id;
      console.log("working");
      const { data } = await deleteForMe(messageId);
      if (data.success) {
        setSelectedChat((prevChats) => {
          if (!prevChats) return prevChats; // Ensure prevChats is not null

          const updatedMessages = prevChats.messages?.filter(
            (message) => message._id !== messageId
          );

          return { ...prevChats, messages: updatedMessages ?? [] };
        });

        setMessagePopup(null);
        toaster.create({
          title: data.message,
          description: "Enjoy",
          type: "success",
        });
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
  const handleDeleteForEveryone = async () => {
    try {
      if (!socket) return;
      const messageId = messagePopup?._id;
      console.log("working");
      const { data } = await deleteForEveryone(messageId);
      if (data.success) {
        setSelectedChat((prevChats) => {
          if (!prevChats) return prevChats; // Ensure prevChats is not null

          const updatedMessages = prevChats.messages?.map((message) => {
            if (message._id === messageId) {
              return { ...message, deletedForEveryone: true };
            }
            return message;
          });

          return { ...prevChats, messages: updatedMessages ?? [] };
        });
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat._id === data?.newMessage?.chat?._id) {
              if (chat.topMessage._id === data?.newMessage?._id) {
                return { ...chat, topMessage: data?.newMessage };
              } else {
                return chat;
              }
            }
            return chat;
          });
        });
        setMessagePopup(null);
        toaster.create({
          title: data.message,
          description: "Enjoy",
          type: "success",
        });
        socket.emit("message_deleted", {
          chat: selectedChat,
          message: data.newMessage,
        });
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
      width={"clamp(300px,40vw,600px)"}
      display={"flex"}
      flexDirection={"column"}
      padding={"15px 30px"}
      position={"absolute"}
      alignSelf={"center"}
      background={dark ? "#3b4a54" : "#ffffff"}
      shadow={dark ? "none" : "lg"}
      borderRadius={"2px"}
      minH={"25vh"}
      className="popup-box"
      zIndex={15}
    >
      <h4 style={{ fontSize: "clamp(15px,5vw,22px)" }}>
        Delete this message ?
      </h4>
      <div
        className="bottom-btns"
        style={{ flexDirection: "column", gap: "20px", alignItems: "flex-end" }}
      >
        {user?._id === messagePopup?.sender && (
          <button className="confirm-btn" onClick={handleDeleteForEveryone}>
            Delete for everyone
          </button>
        )}
        <button className="confirm-btn" onClick={handleDeleteForMe}>
          Delete for me
        </button>
        <button className="cancel-btn" onClick={() => setMessagePopup(null)}>
          Cancel
        </button>
      </div>
    </Box>
  );
};

export default MessagePopup;
