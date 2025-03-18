import { useGlobalState } from "@/app/context/GlobalProvider";
import { ChatType, UserType } from "@/app/types/allTypes";
import { Avatar, Box } from "@chakra-ui/react";
import { AxiosError } from "axios";
import { useRef, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { toaster } from "../../ui/toaster";
import { createGroup } from "@/app/utils/api";
import {
  createChat,
  createGroupChat,
  createSingleChat,
} from "../sideBarComponents/utils/createChat";

const GroupInfo = () => {
  const {
    dark,
    setOption,
    selectedUserForGroup,
    setSelectedUserForGroup,
    setChats,
    user,
    socket,
  } = useGlobalState();
  const [name, setName] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string | null>(
    "https://cdn-icons-png.freepik.com/512/10017/10017806.png"
  );
  const [img, setImg] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const file = event.target.files[0];

    if (file) {
      setImg(file);
      setImgSrc(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const handleSubmit = async () => {
    try {
      const selectedUsers = [...selectedUserForGroup, user];
      const form = new FormData();
      form.append("name", name);
      form.append("selectedUsers", JSON.stringify(selectedUsers));
      if (img) {
        form.append("groupImage", img);
      }
      const { data } = await createGroup(form);
      if (data.success) {
        toaster.create({
          title: data?.message,
          description: "Enjoy",
          type: "success",
        });
        if (socket) socket.emit("new_chat", data.chat);
        const chat = createGroupChat(data.chat);
        setChats((prevChats) => {
          if (!chat) return prevChats;
          return [chat, ...prevChats];
        });
        setSelectedUserForGroup([]);
        setOption("chats");
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
              setSelectedUserForGroup([]);
            }}
          />

          <h3
            style={{
              fontSize: "15px",
              fontWeight: 400,
              letterSpacing: "1px",
              fontFamily: "'Fira Sans', sans-serif",
            }}
          >
            Group Info
          </h3>
        </Box>
      </Box>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        marginTop={"100px"}
      >
        <div
          className="profMain"
          style={{
            position: "relative",
            width: "fit-content", // To ensure the div wraps around the avatar
          }}
        >
          <Avatar.Root
            size={"lg"}
            cursor={"pointer"}
            width={{
              base: "clamp(30px,80vw,195px)",
              md: "clamp(30px,18vw,195px)",
            }}
            height={{
              base: "clamp(30px,80vw,195px)",
              md: "clamp(30px,18vw,195px)",
            }}
            // Customize size
            onClick={() => {
              fileInputRef?.current?.click(); // Simulate input click
            }} // Avatar click handler
          >
            <Avatar.Fallback name={"Group"} />

            <Avatar.Image src={imgSrc || ""} />
          </Avatar.Root>

          <Box
            width={{
              base: "clamp(30px,80vw,195px)",
              md: "clamp(30px,18vw,195px)",
            }}
            height={{
              base: "clamp(30px,80vw,195px)",
              md: "clamp(30px,18vw,195px)",
            }}
            borderRadius={"50%"}
            position={"absolute"}
            top={"0"}
            background={"rgba(0, 0, 0, 0.5)"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            pointerEvents="none"
            transition="opacity 0.3s ease, transform 0.3s ease"
            transform="scale(1)"
            style={{
              pointerEvents: "none",
            }}
            className={!img ? "" : "hoverBox"}
          >
            <h5
              style={{
                letterSpacing: "1px",
                fontWeight: "500",
                fontSize: "14px",
                color: "white",
                width: "50%",
                textAlign: "center",
              }}
            >
              Add group photo
            </h5>
          </Box>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef} // Connect the input with the ref
            style={{ display: "none" }} // Hide the input field
            onChange={handleImageChange}
          />
        </div>
      </Box>

      {/* LABELS START */}
      <Box width={"100%"} minH={"20vh"} marginTop={"5vh"} padding={"10px 30px"}>
        {/* FOR NAME */}
        <input
          type="text"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          className={"active-profile-input profile-input"}
          style={{ width: "100%" }}
          placeholder="Enter group name"
        />
      </Box>
      {name && (
        <Box
          width={{ base: "100%", md: "30%" }}
          position={"fixed"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"flex-start"}
          bottom={0}
          minH={"40vh"}
        >
          <button className="groupBtn" onClick={handleSubmit}>
            Done
          </button>
        </Box>
      )}
    </Box>
  );
};

export default GroupInfo;
