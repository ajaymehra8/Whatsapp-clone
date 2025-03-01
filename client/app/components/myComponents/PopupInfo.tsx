import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box, Text } from "@chakra-ui/react";
import { AxiosError } from "axios";
import React from "react";
import { toaster } from "../ui/toaster";
import { chats, deleteChat } from "@/app/utils/api";

const PopupInfo = () => {
  const { setShowPopup, showPopup, setChats,selectedChat,setSelectedChat,setOtherUserId } = useGlobalState();

  const handleDelete = async () => {
    try {
      const chatId = showPopup;
     
      const { data } = await deleteChat(chatId);
      if (data.success) {
        if(chatId===selectedChat?._id){
          setSelectedChat(null);
          setOtherUserId("");
        }
        setChats((prevChats) =>
          prevChats.filter((chat) => chat._id !== chatId)
        );
        setShowPopup("");
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

  return (
    <Box
      width={"clamp(300px,40vw,600px)"}
      display={"flex"}
      flexDirection={"column"}
      padding={"15px 30px"}
      position={"absolute"}
      alignSelf={"center"}
      background={"#3b4a54"}
      borderRadius={"2px"}
      minH={"25vh"}
      className="popup-box"
      zIndex={15}
    >
      <h4 style={{ fontSize: "clamp(15px,5vw,22px)" }}>Delete this chat ?</h4>
      <div className="bottom-btns" >
        <button className="cancel-btn" onClick={() => setShowPopup("")}>
          Cancel
        </button>
        <button className="confirm-btn" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </Box>
  );
};

export default PopupInfo;
