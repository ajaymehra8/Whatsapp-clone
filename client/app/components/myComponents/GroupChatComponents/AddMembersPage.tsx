import React, { useEffect, useRef, useState } from "react";
import { Box, Avatar } from "@chakra-ui/react";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { IoIosArrowRoundBack } from "react-icons/io";

import SearchBar from "../sideBarComponents/SearchBar";
import { ChatType, UserType } from "@/app/types/allTypes";
import UserCard from "./UserCard";
import { toaster } from "../../ui/toaster";
import { AxiosError } from "axios";
import { Akatab } from "next/font/google";
import { addMembers } from "@/app/utils/api";
import { createGroupChat } from "../sideBarComponents/utils/createChat";
interface propType {
  group?: ChatType | null;
  setAddMember?: React.Dispatch<React.SetStateAction<boolean>>;
  setGroupMembers?: React.Dispatch<React.SetStateAction<UserType[]>>;
}

const AddMembersPage: React.FC<propType> = ({
  group,
  setAddMember,
  setGroupMembers,
}) => {
  const { dark, setOption, setSelectedUserForGroup, setShowGroup } =
    useGlobalState();
  const [searchUsers, setSearchUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [noItemText, setNoItemText] = useState("No users searched.");
  const divRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>(0);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footHeight, setFootHeight] = useState<number>(0);

  const addUsers = async (selectedUsers: UserType[]) => {
    const selectedUsersId = selectedUsers?.map((user) => user?._id);
    console.log(selectedUsersId);
    try {
      const { data } = await addMembers(group?._id, selectedUsersId);
      if (data.success) {
        console.log(data.chat);
        toaster.create({
          title: data.message,
          description: "Enjoy",
          type: "success",
        });
        if (setAddMember) setAddMember(false);
        if (setGroupMembers) setGroupMembers(data.chat.users);
        const groupChat=createGroupChat(data.chat);
        setShowGroup(groupChat);
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

  useEffect(() => {
    if (!divRef.current) return;

    const footerObserver = new ResizeObserver(([entry]) => {
      const heightInVH = (entry.contentRect.height / window.innerHeight) * 100;
      setFootHeight(heightInVH);
    });

    const observer = new ResizeObserver(([entry]) => {
      const heightInVH = (entry.contentRect.height / window.innerHeight) * 100;
      setHeight(heightInVH);
    });
    if (footerRef.current) footerObserver.observe(footerRef.current); // Corrected reference
    observer.observe(divRef.current);

    return () => {
      observer.disconnect();
      footerObserver.disconnect();
    };
  }, [selectedUsers]); // Re-run when selectedUsers change

  return (
    <Box
      borderRight={dark ? "1px solid #222c33" : "1px solid #d1d7db"}
      width={{ base: "100%", md: group ? "100%" : "95%" }}
      marginLeft={{ base: "0", md: group ? 0 : "14%" }}
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
        ref={divRef}
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
              if (group) {
                if (setAddMember) setAddMember(false);
                return;
              }
              setOption("chats");
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
            Add group members
          </h3>
        </Box>
        {selectedUsers.length > 0 && (
          <Box
            width={"100%"}
            padding={"0 20px"}
            pt={"10px"}
            height={"auto"}
            display={"flex"}
            flexWrap={"wrap"}
            justifyContent={"start"}
            alignItems={"center"}
            maxHeight={"300px"}
            overflow={"auto"}
            gap={"5px"}
          >
            {selectedUsers?.map((user: UserType) => (
              <div className="userBox">
                <Avatar.Root style={{ width: "25px", height: "25px" }}>
                  <Avatar.Fallback name={"Ajay"} />
                  <Avatar.Image
                    src={
                      user.image?.visibility
                        ? user.image.link
                        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
                    }
                  />
                </Avatar.Root>
                <p>{user?.name}</p>
                <button
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedUsers((prevUsers) =>
                      prevUsers.filter((u) => u._id !== user._id)
                    );
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </Box>
        )}

        <SearchBar
          setChats={setSearchUsers}
          setNoItemText={setNoItemText}
          onlyUser={true}
          group={group ? group : undefined}
        />
      </Box>
      <Box
        width={"100%"}
        display={"flex"}
        flexDirection={"column"}
        p={"5px 0"}
        mt={height + 2.2 + "vh"}
        height={100 - (height + 3) + "vh"}
        pb={{ base: "30px", md: 0 }}
        overflowY={"auto"}
        bg={dark ? "#111b21" : "#fff"}
      >
        {searchUsers.length > 0 ? (
          <Box position={"relative"}>
            {searchUsers.map((user: UserType) => (
              <UserCard
                user={user}
                key={user?._id}
                setSelectedUsers={setSelectedUsers}
              />
            ))}
          </Box>
        ) : (
          <h1 className="no-item-text">{noItemText}</h1>
        )}
      </Box>
      {selectedUsers?.length > 0 && (
        <Box
          width={{ base: "100%", md: "30%" }}
          position={"fixed"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          bottom={0}
          minH={"10vh"}
        >
          <button
            className="groupBtn"
            onClick={() => {
              if (!group) {
                setSelectedUserForGroup(selectedUsers);
                return;
              }
              addUsers(selectedUsers);
            }}
          >
            {group ? "Done" : "Next"}{" "}
          </button>
        </Box>
      )}
    </Box>
  );
};

export default AddMembersPage;
