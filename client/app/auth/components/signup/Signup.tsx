"use client";
import { Box, Button, VStack, Text } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { signupSchema } from "../../utils/formValidation";
import InputField from "../InputField";
import FlexLayout from "../FlexLayout";
import Link from "next/link";
import { signup } from "../../../utils/api";
import { toaster } from "@/app/components/ui/toaster";
import { AxiosError } from "axios";
import { useRouter, usePathname } from "next/navigation";

import { useGlobalState } from "@/app/context/GlobalProvider";
const Signup = () => {
  const {setUser,setToken}=useGlobalState();

  const handleSubmit=async (values:any, actions:any) => {
    try {
      const { data } = await signup(values);
      setUser(data?.user);
      setToken(data?.jwt);
      localStorage.setItem("user",JSON.stringify(data.user));
      localStorage.setItem("token",data.jwt);
      // const tempSocket = getSocket(user);
      // setSocket(tempSocket);
      toaster.create({
        title: data.message,
        description:"Enjoy",
        type:"success"
      });
      actions.resetForm();
      
    } catch (err) {
      
      if(err instanceof AxiosError)
      toaster.create({
        title: err?.response?.data.message || "Error in signup",
        description:"Try again",
        type:"error"
      });
      console.log(err);
    } finally {
      actions.setSubmitting(false);
    }
  };
  return (
    <Box
      width={"33%"}
      height={"100vh"}
      bg={"#f0f2f5"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Box
        p={8}
        boxShadow="sm"
        borderRadius="md"
        bg="white"
        width="350px"
        minH={"400px"}
      >
        <Box mb={"50px"}>
          <Text
            textAlign="left"
            color={"black"}
            fontSize={"25px"}
            fontWeight={400}
            letterSpacing={"1px"}
          >
            Create new account.
          </Text>
          <p
            style={{
              color: "black",
              letterSpacing: "1px",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            Have an account{" "}
            <Link href={"/auth/login"} style={{ color: "blue" }}>
              Log in
            </Link>
            ?{" "}
          </p>
        </Box>
        <Formik
          initialValues={{ email: "", password: "", name: "" }}
          validationSchema={signupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <VStack>
                <InputField name="email" type="email" />
                <InputField name="name" type="name" />

                <InputField name="password" type="password" />
              </VStack>
              <button type="submit" className="submit-btn">
                Signup
              </button>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default Signup;
