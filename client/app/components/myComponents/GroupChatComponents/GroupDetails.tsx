"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Avatar, Box } from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { AxiosError } from "axios";
import { toaster } from "@/app/components/ui/toaster";
import { IoMdPersonAdd } from "react-icons/io";
import { MdExitToApp } from "react-icons/md";

import { FaBan } from "react-icons/fa6";
import { IoIosArrowRoundBack } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  getGroupMembers,
  getUser,
  leaveGroup,
  updateGroup,
} from "@/app/utils/api";
import { UserType } from "@/app/types/allTypes";
import EditableField from "../sideBarComponents/optionPages/profileComponent/EditableField";
import MemberCard from "./GroupDetailComponent/MemberCard";
import {
  createGroupChat,
  createSingleChat,
} from "../sideBarComponents/utils/createChat";
import AddMembersPage from "./AddMembersPage";
import { group } from "console";

const GroupDetails = () => {
  const {
    dark,
    showGroup,
    setShowGroup,
    user,
    selectedChat,
    setSelectedChat,
    setChats,
  } = useGlobalState();
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [img, setImg] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [change, setChange] = useState<boolean>(false);
  const [groupMembers, setGroupMembers] = useState<UserType[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addMember, setAddMember] = useState(false);

  const exitGroup = async () => {
    try {
      const { data } = await leaveGroup(showGroup?._id);
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
      if (err instanceof AxiosError) {
        toaster.create({
          title: err?.response?.data?.message || "Problem in fetching chats",
          description: "Try again",
          type: "error",
        });
      }
    }
  };

  // group update function
  const handleGroupUpdate = async () => {
    try {
      const form = new FormData();
      if (img) {
        form.append("groupImage", img);
      }
      if (name) {
        form.append("name", name);
      }
      if (showGroup) form.append("group", showGroup?._id);
      console.log(img, name);
      const { data } = await updateGroup(form);
      if (data.success) {
        toaster.create({
          title: data?.message,
          description: "Enjoy",
          type: "success",
        });
        const groupChat = createGroupChat(data.chat);
        const forChats = createGroupChat(data.chat);
        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c._id === forChats?._id) {
              return forChats ? forChats : c;
            }
            return c;
          })
        );
        setSelectedChat(groupChat);
        setShowGroup(groupChat);
        setChange(false);
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

  const fetchGroupMembers = async () => {
    try {
      const { data } = await getGroupMembers(showGroup?._id);
      if (data.success) {
        setGroupMembers(data.members);
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
  useEffect(() => {
    fetchGroupMembers();
  }, []);

  useEffect(() => {
    setImgSrc(
      showGroup?.image?.link ||
        "https://www.criconet.com/upload/photos/d-group.jpg"
    );
    setName(showGroup?.name || "");
  }, [showGroup]);
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const file = event.target.files[0];

    if (file) {
      setChange(true);
      setImg(file);
      setImgSrc(URL.createObjectURL(file)); // Create a preview URL
    }
  };
  return (
    <Box
      borderLeft={dark ? "1px solid #222d34" : "1px solid #d1d7db"}
      background={dark ? "#0c1317" : "#d1d7db"}
      width={{ base: "100%", md: "30%" }}
      height={"100vh"}
      overflowY={"auto"}
      zIndex={100}
      display={"flex"}
      flexDirection={"column"}
      gap={"10px"}
    >
      {addMember ? (
        <AddMembersPage
          group={showGroup}
          setAddMember={setAddMember}
          setGroupMembers={setGroupMembers}
        />
      ) : (
        <>
          <Box
            width={{ base: "100%", md: "100%" }}
            height={"auto"}
            paddingTop={"15px"}
            background={dark ? "#111b21" : "#ffffff"}
            paddingBottom={"15px"}
          >
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"start"}
              width={"100%"}
              padding={"0 10px"}
            >
              <IoIosArrowRoundBack
                cursor={"pointer"}
                size={"clamp(30px,3vw,40px)"}
                style={{ marginRight: "5px" }}
                onClick={() => setShowGroup(null)}
              />

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  fontFamily: "'Fira Sans', sans-serif",
                }}
              >
                Group info
              </h3>
            </Box>
            <Box
              display={"flex"}
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              gap={"5px"}
              marginTop={"30px"}
            >
              <div
                className="profMain"
                style={{
                  position: "relative",
                  width: "fit-content", // To ensure the div wraps around the avatar
                }}
              >
                <Avatar.Root
                  cursor={"pointer"}
                  padding={"0"}
                  width={{
                    base: "clamp(30px,80vw,195px)",
                    md: "clamp(30px,18vw,195px)",
                  }}
                  height={{
                    base: "clamp(30px,80vw,195px)",
                    md: "clamp(30px,18vw,195px)",
                  }}
                  onClick={() => {
                    showGroup?.groupAdmin === user?._id &&
                      showGroup?.users?.some((u) => u._id === user?._id) &&
                      fileInputRef?.current?.click();
                  }}
                >
                  <Avatar.Fallback name={showGroup?.name} />

                  <Avatar.Image src={imgSrc} />
                </Avatar.Root>
                {user?._id === showGroup?.groupAdmin &&
                  showGroup?.users?.some((u) => u._id === user?._id) && (
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
                      transform="scale(0.9)"
                      style={{
                        pointerEvents: "none",
                      }}
                      className="hoverBox"
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
                        Change Group Photo
                      </h5>
                    </Box>
                  )}

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef} // Connect the input with the ref
                  style={{ display: "none" }} // Hide the input field
                  onChange={handleImageChange}
                />
              </div>
              <Box
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                flexDir={"column"}
              >
                {showGroup?.groupAdmin === user?._id &&
                showGroup?.users?.some((u) => u._id === user?._id) ? (
                  <EditableField
                    value={name}
                    setValue={setName}
                    userValue={showGroup?.name || ""}
                    maxLength={20}
                    width="fit-content"
                    setChange={setChange}
                  />
                ) : (
                  <h3 style={{ letterSpacing: "2px" }}>{showGroup?.name}</h3>
                )}
              </Box>
              {change && (
                <Box
                  width={"100%"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  marginTop={"20px"}
                >
                  <button className="default-btn" onClick={handleGroupUpdate}>
                    Update
                  </button>
                </Box>
              )}
            </Box>
          </Box>

          <Box
            width={{ base: "100%", md: "100%" }}
            paddingTop={"15px"}
            background={dark ? "#111b21" : "#ffffff"}
            paddingBottom={"15px"}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
          >
            {showGroup?.users?.some((u) => u._id === user?._id) ? (
              <>
                <Box
                  width={"100%"}
                  padding={{ base: "5px 20px", md: "0 40px" }}
                >
                  <p style={{ fontSize: "15px", color: "#8696a0" }}>
                    {groupMembers?.length} members
                  </p>
                </Box>

                {showGroup?.groupAdmin === user?._id && (
                  <Box
                    display={"flex"}
                    flexDir={"column"}
                    width={"100%"}
                    justifyContent={"center"}
                    alignItems={"flex-start"}
                    padding={"5px 0"}
                    gap={"20px"}
                    _hover={{
                      background: dark ? "#202c33" : "#f0f2f5",
                    }}
                  >
                    <button
                      style={{
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        padding: "5px 40px",
                        width: "100%",
                      }}
                      onClick={() => {
                        setAddMember(true);
                      }}
                    >
                      <span className="groupBtnIcon">
                        <IoMdPersonAdd style={{ display: "inline" }} />
                      </span>
                      Add Member
                    </button>
                  </Box>
                )}

                <Box width={"100%"}>
                  {groupMembers.map((user) => (
                    <MemberCard
                      memberUser={user}
                      key={user?._id}
                      setGroupMembers={setGroupMembers}
                    />
                  ))}
                </Box>
              </>
            ) : (
              <Box
                display={"flex"}
                flexDir={"column"}
                width={"100%"}
                justifyContent={"center"}
                alignItems={"center"}
                padding={"5px 0"}
                gap={"20px"}
              >
                <h4>You left the group</h4>
              </Box>
            )}
          </Box>
          {showGroup?.users?.some((u) => u._id === user?._id) && (
            <Box
              width={{ base: "100%", md: "100%" }}
              paddingTop={"15px"}
              background={dark ? "#111b21" : "#ffffff"}
              paddingBottom={"15px"}
              height={"auto"}
              display={"flex"}
              alignItems={"flex-start"}
              justifyContent={"center"}
              flexDirection={"column"}
              gap={"5px"}
            >
              <Box
                display={"flex"}
                minH={"45px"}
                width={"100%"}
                padding={{ base: "5px 20px", md: "0 40px" }}
                alignItems={"center"}
                gap={"25px"}
                cursor={"pointer"}
                background={dark ? "#111b21" : "#ffffff"}
                _hover={{
                  background: dark ? "#202c33" : "#f0f2f5",
                }}
                letterSpacing={"1px"}
                color={dark ? "#ac4855" : "#ef426c"}
                onClick={exitGroup}
              >
                <MdExitToApp size={"17px"} />

                <p style={{ fontSize: "17px" }}>Exit group</p>
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default GroupDetails;
