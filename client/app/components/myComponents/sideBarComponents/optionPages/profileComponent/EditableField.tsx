"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Avatar, Box } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { HiPencil } from "react-icons/hi";
interface EditableFieldProp {
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  userValue: string;
  maxLength: number;

}
const EditableField: React.FC<EditableFieldProp> = ({
  label,
  value,
  setValue,
  userValue,
  maxLength = 20,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleEditClick = () => {
    if (isEditing) {
      setValue(userValue || value);
  
    } else {
      setTimeout(() => inputRef.current?.focus(), 0); 
    }
    setIsEditing(!isEditing);
  };
  return (
    <Box lineHeight={"1.8"} width={"100%"} marginTop={"3vh"}>
      <p className="label">{label}</p>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <input
                  ref={inputRef}

          type="text"
          disabled={!isEditing}
          value={value}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          className={
            isEditing ? "active-profile-input profile-input" : "profile-input"
          }
        />
        <HiPencil
          size={"25px"}
          cursor={"pointer"}
          color="#8696a0"
          onClick={handleEditClick}
        />
      </Box>
    </Box>
  );
};
export default EditableField;
