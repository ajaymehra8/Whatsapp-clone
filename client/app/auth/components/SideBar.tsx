import { Box, Image } from "@chakra-ui/react";
import Link from "next/link";
const SideBar = () => {
  return (
    <Box
      bg={
        "url(https://media.istockphoto.com/id/902453536/vector/smartphones.jpg?s=1024x1024&w=is&k=20&c=SJIpHkvb0xPtRia5_tnr6VmepTACWcmMmlGCGVmyKbw=)"
      }
      backgroundRepeat={"no-repeat"}
      backgroundSize={"cover"}
      width={{ md: "60%", lg: "70%" }}
      h={"100vh"}
      display={{ lg: "flex", md: "flex", sm: "none" }}
      justifyContent={"center"}
      alignItems={"center"}
      flexDir={{ lg: "row", md: "column-reverse" }}
      className="test"
    >
      {/* <Box
           width={{lg:"35%"}}
           height={"100%"}
           display={{lg:"flex",md:"flex"}}
           flexDirection={"column"}
           justifyContent={"start"}
           alignItems={"start"}
           p={{lg:"80px 20px 0",md:"50px 20px 0"}}
         >
           <h1
             style={{
               color: "white",
               fontSize: "clamp(20px,5vw,30px)",
               fontWeight: "700",
               letterSpacing: "1px",
             }}
           >
             Doctor's are here.
           </h1>
           <p
             style={{
               color: "white",
               fontSize: "clamp(10px,2vw,15px)",
               fontWeight: "400",
               letterSpacing: "2px",
               textAlign: "justify",
               alignSelf: "center",
             }}
           >
             Connect with expert doctors, prioritize your health, and enjoy
             affordable care—sign up today.
           </p>
           
         </Box> */}
      {/* <Box
        width={{ lg: "65%", md: "100%" }}
        height={"100%"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"start"}
        pt={"80px"}
      >
        <Image
          src="https://media.istockphoto.com/id/902453536/vector/smartphones.jpg?s=612x612&w=0&k=20&c=UtxmytEjTRCelaCH1lYx4UXJinAlpeisQiGIu_lNzwM="
          alt=""
          style={{
            width: "90%",
            borderRadius: "100px 0 100px 0",
          }}
          height={"80%"}
        />
      </Box> */}
    </Box>
  );
};

export default SideBar;
