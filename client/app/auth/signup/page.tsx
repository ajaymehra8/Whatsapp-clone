"use client";
import { Box, Button, VStack, Heading } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { loginSchema } from "../utils/formValidation";
import InputField from "../components/InputField";
import FlexLayout from "../components/FlexLayout";
import SideBar from "../components/SideBar";
import Signup from "../components/signup/Signup";
import { useRouter } from "next/navigation";
import { useGlobalState } from "@/app/context/GlobalProvider";

const SignupPage = () => {
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
      <Signup />

      <SideBar />
    </Box>
  );
};

export default SignupPage;
