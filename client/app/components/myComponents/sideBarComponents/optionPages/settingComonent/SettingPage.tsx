import React from "react";
import { Box } from "@chakra-ui/react";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { IoMdExit } from "react-icons/io";
import { MdOutlineComment } from "react-icons/md";
import SettingCard from "./SettingCard";
import OptionCard from "./OptionsCard";

interface propType {
  details: { heading: string };
}
const SettingPage: React.FC<propType> = ({ details }) => {
  const { dark, setOption } = useGlobalState();
const settings = [

    {
      id: 2,
      name: "Last Seen",
    },
    {
      id: 3,
      name: "Profile Photo",
    },
    {
      id: 4,
      name: "About",
    },
  ];
  return (
    <Box
      borderRight={dark ? "1px solid #222c33" : "1px solid #d1d7db"}
      width={{ base: "100%", md: "95%" }}
      marginLeft={{ base: "0", md: "14%" }}
      overflowY={"hidden"}
    >
      <Box
        position={"fixed"}
        top={"0"}
        width={{ base: "100%", md: "30%" }}
        minH={"5vh"}
        paddingTop={"15px"}
        zIndex={2}
        bg={dark ? "#111b21" : "#ffffff"}
        overflow={"hidden"}
      >
        <Box
          display={"flex"}
          justifyContent={"start"}
          alignItems={"center"}
          width={"100%"}
          padding={"0 10px"}
        >
          <IoIosArrowRoundBack
            cursor={"pointer"}
            size={"clamp(30px,3vw,40px)"}
            style={{ marginRight: "5px" }}
            onClick={() => {
              setOption("setting");
            }}
          />

          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "1px",
              fontFamily: "'Fira Sans', sans-serif",
            }}
          >
            {details?.heading}
          </h3>
        </Box>
      </Box>
      <Box position={"relative"} marginTop={"10vh"} p={"0 30px"}>
          {settings.map((setting) => {
            return <OptionCard key={setting.id} setting={setting} />;
          })}
</Box>
    </Box>
  );
};

export default SettingPage;
