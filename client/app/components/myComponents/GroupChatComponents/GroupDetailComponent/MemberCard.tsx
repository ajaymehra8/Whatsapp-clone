"use client";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { Avatar, Box } from "@chakra-ui/react";
import { UserType } from "@/app/types/allTypes";
import { useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import MemberOptions from "./MemberOption";

interface propType {
  memberUser: UserType;
  setGroupMembers: React.Dispatch<React.SetStateAction<UserType[]>>;
}
const MemberCard: React.FC<propType> = ({ memberUser, setGroupMembers }) => {
  const [member, setMember] = useState<UserType | null>(null);
  const { dark, showGroup, user } = useGlobalState();
  const toggleOptions = (e: React.MouseEvent<HTMLOrSVGElement>) => {
    e?.stopPropagation();
    setMember((prev) => (prev?._id === memberUser._id ? null : memberUser));
  };
  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"start"}
        padding={{ base: "5px 20px", md: "10px 40px" }}
        alignItems={"center"}
        gap={"20px"}
        cursor={"pointer"}
        position={"relative"}
        width={"100%"}
        background={dark ? "#111b21" : "#ffffff"}
        _hover={{
          background: dark ? "#202c33" : "#f0f2f5",
          "& .chatCardCorner .downIcon": { display: "inherit!important" },
        }}
      >
        {member?._id === memberUser?._id &&
          (user?._id !== memberUser?._id ||
            user?._id === showGroup?.groupAdmin) && (
            <MemberOptions setMember={setMember} member={member} setGroupMembers={setGroupMembers}/>
          )}
        <Avatar.Root size={"lg"}>
          <Avatar.Fallback name={memberUser?.name} />
          <Avatar.Image
            src={
              memberUser?.image?.visibility
                ? memberUser?.image?.link
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
            }
          />
        </Avatar.Root>
        <div className="textBox">
          <p
            style={{ fontSize: "16px", fontWeight: 400, padding: 0, margin: 0 }}
          >
            {memberUser?._id !== user?._id ? memberUser?.name : "You"}
          </p>
          {memberUser?.about?.content && memberUser?._id !== user?._id ? (
            <p
              style={{
                fontSize: "12px",
                padding: 0,
                margin: 0,
                color: "#667781",
                marginTop: "-2px",
              }}
            >
              {memberUser?.about?.content}
            </p>
          ) : (
            ""
          )}
        </div>
        <div className="chatCardCorner">
          {showGroup?.groupAdmin === memberUser?._id && <p>Admin</p>}
          {user?._id !== memberUser?._id && (
            <FaChevronDown
              color="#aebac1"
              className="downIcon"
              onClick={toggleOptions}
            />
          )}
        </div>
      </Box>
    </>
  );
};

export default MemberCard;
