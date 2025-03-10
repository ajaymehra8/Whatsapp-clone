"use client";
import React,{useEffect} from "react";
import { Box } from "@chakra-ui/react";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { changePrivacy } from "@/app/utils/api";
import { AxiosError } from "axios";
import { toaster } from "@/app/components/ui/toaster";

import { UserType } from "@/app/types/allTypes";

interface PropType {
  setting: {
    name: string;
  };
}
const OptionCard: React.FC<PropType> = ({ setting }) => {
  const { dark, user, setUser } = useGlobalState();
  

  const selectedValue =
    setting.name === "Last Seen"
      ? user?.lastSeen?.visibility
        ? "everyone"
        : "nobody"
      : setting.name === "Profile Photo"
      ? user?.image?.visibility
        ? "everyone"
        : "nobody"
      : setting.name === "About"
      ? user?.about?.visibility
        ? "everyone"
        : "nobody"
      : "everyone";

  const handleSelectChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    try {
      if (setting.name === "Last Seen") {
        const { data } = await changePrivacy(event.target.value);
        setUser(data.user);
        localStorage.setItem("user",JSON.stringify(data.user));

        toaster.create({
          title: data?.message,
          description: "Enjoy!",
          type: "success",
        });
      } else if (setting.name === "Profile Photo") {
        const { data } = await changePrivacy(null, event.target.value);
        setUser(data.user);
        localStorage.setItem("user",JSON.stringify(data.user));

        toaster.create({
          title: data?.message,
          description: "Enjoy!",
          type: "success",
        });
      } else if (setting.name === "About") {
        const { data } = await changePrivacy(null, null, event.target.value);
        console.log(data.value)
        setUser(data.user);
        localStorage.setItem("user",JSON.stringify(data.user));

        toaster.create({
          title: data?.message,
          description: "Enjoy!",
          type: "success",
        });
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

  return (
    <>
      <Box
        display={"flex"}
        minH={"55px"}
        justifyContent={"space-between"}
        padding={{ base: "10px 20px 0 0", md: "20px 20px 0 0" }}
        alignItems={"center"}
        cursor={"pointer"}
        borderBottom={`1px solid ${dark ? "#222d34" : "#e9edef"}`}
        onClick={() => {}}
      >
        <label htmlFor={setting.name}>{setting.name}</label>
        <select
          id={setting.name}
          name="options"
          className="select"
          value={selectedValue}
          onChange={handleSelectChange}
        >
          <option value="everyone" className="option">Everyone</option>
          <option value="nobody" className="option">Nobody</option>
        </select>
      </Box>
    </>
  );
};

export default OptionCard;
