"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Avatar, Box } from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import EditableField from "./profileComponent/EditableField";
import { AxiosError } from "axios";
import { toaster } from "@/app/components/ui/toaster";
import { updateUser } from "@/app/utils/api";
import { IoIosArrowRoundBack } from "react-icons/io";
interface PropType{
  option:string
}
const Profile:React.FC<PropType> = ({option}) => {
  const { user, dark, setUser,setOption } = useGlobalState();
  const [name, setName] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [img, setImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = async () => {

    try {
      setLoading(true);
      const formData = new FormData();
      if (!img && !name && !about) {
        alert("Provide a field");
        return;
      }
      if (img) {
        formData.append('image', img);
      }
      if (name) {
        formData.append('name', name);

      }
      if (about) {
        formData.append('about', about);

      }
      const { data } = await updateUser(formData);
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
    if (user) {
      setAbout(user?.about || "On Whatsapp");
      setImgSrc(user?.image?.link || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvodrlyTZzayZIVYMNDeGx_vAKPj8-Br7Z6Q&s");
    }
  }, [user]); // Runs when `user` changes

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
          alignItems={'center'}
          justifyContent={"start"}
          width={"100%"}
          padding={"0 10px"}
        >
<IoIosArrowRoundBack cursor={"pointer"} size={'clamp(30px,3vw,40px)'} style={{marginRight:"5px"}} onClick={()=>{setOption(option)}}/>

          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "1px",
              fontFamily: "'Fira Sans', sans-serif",
            }}
          >
            Profile
          </h3>
        </Box>
      </Box>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        marginTop={"100px"}
      >

        <div className="profMain" style={{
          position: "relative",
          width: "fit-content", // To ensure the div wraps around the avatar
        }}>
          <Avatar.Root
            size={"lg"}
            bg={"blue"}
            cursor={"pointer"}
           
              width= {{base:"clamp(30px,80vw,195px)",md:"clamp(30px,18vw,195px)"}}
              height= {{base:"clamp(30px,80vw,195px)",md:"clamp(30px,18vw,195px)"}}
            
            // Customize size
            onClick={() => {
              fileInputRef?.current?.click(); // Simulate input click
            }} // Avatar click handler

          >
            <Avatar.Fallback name={user?.name} />

            <Avatar.Image
              src={imgSrc || ""
              }
            />
          </Avatar.Root>


          <Box
           width= {{base:"clamp(30px,80vw,195px)",md:"clamp(30px,18vw,195px)"}}
           height= {{base:"clamp(30px,80vw,195px)",md:"clamp(30px,18vw,195px)"}}
            borderRadius={"50%"}
            position={"absolute"}
            top={"0"}
            background={"rgba(0, 0, 0, 0.5)"} // Set background with opacity
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            pointerEvents="none" // Prevent interaction when hidden
            transition="opacity 0.3s ease, transform 0.3s ease" // Smooth animation
            transform="scale(0.9)" // Start smaller for animation effect
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
                textAlign: "center"
              }}
            >
              Change Profile Photo
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
      <Box width={"100%"} minH={"20vh"} marginTop={"3vh"} padding={"10px 30px"}>
        {/* FOR NAME */}
        <EditableField
          label="Your Name"
          value={name}
          setValue={setName}
          userValue={user?.name}
          maxLength={20}
        />

        {/* FOR ABOUT */}
        <EditableField
          label="About"
          value={about}
          setValue={setAbout}
          userValue={user?.about || "On Whatsapp"}
          maxLength={50}
        />

        {/* FOR EMAIL */}
        <Box lineHeight={"1.8"} width={"100%"} marginTop={"3vh"}>
          <p className="label">Email</p>
          <Box
            width={"100%"}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <input
              type="text"
              disabled
              value={user?.email}
              className={"profile-input"}
            />
          </Box>
        </Box>
        <Box width={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'} marginTop={'20px'}>
          <button className="default-btn" onClick={updateProfile}>{!loading ? "Update" : "Updating..."}</button>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
