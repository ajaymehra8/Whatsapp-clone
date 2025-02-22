import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface FlexLayoutProps {
    children: ReactNode;
  }

const FlexLayout = ({children}:FlexLayoutProps) => {
  return (
    <Box
      display={"flex"}
      width={"100vw"}
      minH={"100vh"}
      alignItems={"center"}
      justifyContent={"center"}

    >
      {children}
    </Box>
  );
};

export default FlexLayout;
