"use client";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { Avatar, Box } from "@chakra-ui/react";
import { UserType } from "@/app/types/allTypes";
import { useRef } from "react";


interface propType{
user:UserType,
setSelectedUsers:React.Dispatch<React.SetStateAction<UserType[]>>
};
const UserCard:React.FC<propType> = ({ user,setSelectedUsers }) => {
  const { dark} = useGlobalState();
  return (
    <>
      <div className="line" />
      <Box
        display={"flex"}
        minH={"75px"}
        justifyContent={"start"}
        padding={{ base: "5px 20px", md: "10px 20px" }}
        alignItems={"center"}
        gap={"20px"}
        cursor={"pointer"}
        position={"relative"}
        background={dark ? "#111b21" : "#ffffff"}
        _hover={{
          background: dark ? "#202c33" : "#f0f2f5",
        }}
        onClick={() => {
          setSelectedUsers((prevUsers)=>{
            const userExists=prevUsers.filter(u=>u._id===user._id);
            if(userExists.length>0){
              return prevUsers;
            }
            return [...prevUsers,user]
          });
        }}
      >
        <Avatar.Root size={"lg"}>
          <Avatar.Fallback name={user?.name} />
          <Avatar.Image
            src={
              user?.image?.visibility
                ? user?.image?.link
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s"
            }
          />
        </Avatar.Root>
        <div className="textBox">
          <p
            style={{ fontSize: "16px", fontWeight: 400, padding: 0, margin: 0 }}
          >
            {user?.name}
          </p>
          {user?.about?.content ? (
            <p
              style={{
                fontSize: "12px",
                padding: 0,
                margin: 0,
                color: "#667781",
                marginTop: "-2px",
              }}
            >
              {user?.about?.content}
            </p>
          ) : (
            ""
          )}
        </div>
      </Box>
    </>
  );
};

export default UserCard;
