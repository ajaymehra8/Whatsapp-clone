import { useGlobalState } from "@/app/context/GlobalProvider";
import { Box } from "@chakra-ui/react";
import React from "react";
interface Props{
  openOptionId:string|null,
  setOpenOptionId:React.Dispatch<React.SetStateAction<string|null>>,
};
const CardOptions:React.FC<Props> = ({openOptionId, setOpenOptionId }) => {
  const { setShowPopup } = useGlobalState();
  return (
    <Box
      w={"40%"}
      position={"absolute"}
      p={"10px 0"}
      right={"3%"}
      bottom={"-70px"}
      zIndex={10}
      background={"#233138"}
      transition={"all .5s"}
    >
      <ul className="option-ul">
        <li className="option-item">Pin chat</li>
        <li
          className="option-item"
          onClick={(e) => {
            e.stopPropagation();
            if(openOptionId)
            setShowPopup(openOptionId);
            setOpenOptionId(null);
          }}
        >
          Delete chat
        </li>
      </ul>
    </Box>
  );
};

export default CardOptions;
