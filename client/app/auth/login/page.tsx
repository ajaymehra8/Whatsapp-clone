"use client";
import { Box, Button, VStack, Heading } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { loginSchema } from "../utils/formValidation";
import InputField from "../components/InputField";
import FlexLayout from "../components/FlexLayout";
import SideBar from "../components/SideBar";
import Login from "../components/Login/Login";
import { useGlobalState } from "@/app/context/GlobalProvider";
import { useRouter } from "next/navigation";

const LoginPage = () => {
    const { token } = useGlobalState();
    const router = useRouter();
    if (token) {
      router.replace("/");
    }
  return (
    <Box
      display={"flex"}
      width={"100vw"}
      height={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
    >
            <Login/>

      <SideBar/>
    </Box>
  );
};

export default LoginPage;
