"use client";
import React from "react";
import { Box } from "@chakra-ui/react";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { IconType } from "react-icons";
import { inherits } from "util";

interface PropType {
  setting: {
    icon?: IconType;
    name: string;
    onClick?: Function;
  };
}
const SettingCard: React.FC<PropType> = ({ setting }) => {
  const { dark } = useGlobalState();
  return (
    <>
      <Box
        display={"flex"}
        minH={"75px"}
        justifyContent={"start"}
        padding={{ base: "5px 20px", md: "10px 20px" }}
        alignItems={"center"}
        gap={"8%"}
        cursor={"pointer"}
        _hover={{
          background: dark ? "#202c33" : "#f0f2f5",
        }}
        onClick={() => setting.onClick && setting.onClick()}
      >
        {setting?.icon && (
          <setting.icon size={"20px"} style={{ color: "#d1d7db" }} />
        )}{" "}
        <p>{setting.name}</p>
      </Box>
      <div className="line" style={{ width: "85%" }} />
    </>
  );
};

export default SettingCard;
