"use client";

import { useGlobalState } from "@/app/context/GlobalProvider";
import { Avatar, Box } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { HiPencil } from "react-icons/hi";
interface EditableFieldProp {
  label?: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  setChange?: React.Dispatch<React.SetStateAction<boolean>>;

  userValue: string;
  maxLength: number;
  width?: string;
}
const EditableField: React.FC<EditableFieldProp> = ({
  label,
  value,
  setValue,
  userValue,
  maxLength = 20,
  width = "100%",
  setChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [widthState, setWidthState] = useState(width);
  const handleEditClick = () => {
    if (isEditing) {
      setWidthState(width);

      setValue(value || userValue);
    } else {
      setWidthState("100%");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    setIsEditing(!isEditing);
  };
  return (
    <Box lineHeight={"1.8"} width={widthState} marginTop={"3vh"}>
      {label && <p className="label">{label}</p>}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <input
          type="text"
          ref={inputRef}
          disabled={!isEditing}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (setChange) setChange(true);
          }}
          className={
            isEditing ? "active-profile-input profile-input" : "profile-input"
          }
          maxLength={maxLength}
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
