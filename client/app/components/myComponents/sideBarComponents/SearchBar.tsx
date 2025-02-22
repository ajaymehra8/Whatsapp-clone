"use client"; // Needed for Next.js App Router (if using)
import React from "react";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { users } from "@/app/utils/api";
import { Box, Input } from "@chakra-ui/react";
import { IoMdSearch } from "react-icons/io";
import { toaster } from "../../ui/toaster";
import { AxiosError } from "axios";
import { createChat } from "./utils/createChat";

interface SearchBarProps {
  setChats: React.Dispatch<React.SetStateAction<any>>;
  setNoItemText: React.Dispatch<React.SetStateAction<string>>;
  setSearchChats?: React.Dispatch<React.SetStateAction<any>>;

}
const SearchBar: React.FC<SearchBarProps> = ({ setChats, setNoItemText }) => {
  const { dark, setFetchAgain, fetchAgain, user } = useGlobalState();
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.value.length < 1) {
        setChats([]);
        setNoItemText("No chats, yet.");

        setFetchAgain(!fetchAgain);
        
        return;
      }
      const { data } = await users(e.target.value);
      if (data.users.length < 1 && data.oneToOneChats.length<1) {
        setNoItemText("No user or email found.");
      }
      setNoItemText("");
      if (data.success) {

        const oneToOneChats = createChat(data.oneToOneChats, user._id);
        setChats([...oneToOneChats,...data.users]);
      }
    } catch (err) {
      if (err instanceof AxiosError)
        toaster.create({
          title: err?.response?.data.message || "Error in login",
          description: "Try again",
          type: "error",
        });
      console.log(err);
    }
  };
  return (
    <Box
      width={"100%"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      mt={"18px"}
    >
      <Box
        width={"95%"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        position={"relative"}
      >
        <IoMdSearch
          style={{
            position: "absolute",
            left: "10px",
            zIndex: 5,
            color: dark ? "#6a7983" : "#54656f",
          }}
        />
        <Input
          placeholder="Search"
          variant="outline"
          borderRadius={"10px"}
          background={dark ? "#202c33" : "#f0f2f5"}
          padding={"5px 10px"}
          paddingLeft={"60px"}
          width={"100%"}
          outline={"none"}
          border={"none"}
          maxH={"5.5vh"}
          onChange={handleSearch}
          _placeholder={{ color: dark ? "#6a7983" : "gray" }} // Change placeholder color
          fontSize={"13.5px"}
        />
      </Box>
    </Box>
  );
};

export default SearchBar;
