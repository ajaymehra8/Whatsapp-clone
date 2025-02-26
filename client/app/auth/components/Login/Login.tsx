"use client";
import { Box, Button, VStack, Text } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { loginSchema } from "../../utils/formValidation";
import InputField from "../InputField";
import FlexLayout from "../FlexLayout";
import Link from "next/link";
import { toaster } from "@/app/components/ui/toaster";
import { AxiosError } from "axios";
import { login } from "@/app/utils/api";
import { useGlobalState } from "@/app/context/GlobalProvider";
import getSocket from "@/lib/socket";
const Login = () => {
  const { setUser, setToken} = useGlobalState();

  const handleSubmit = async (values: any, actions: any) => {
    try {
      const { data } = await login(values);
      setUser(data?.user);
      setToken(data?.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.jwt);
      // const tempSocket = getSocket(user);
      // setSocket(tempSocket);
      toaster.create({
        title: data.message,
        description: "Enjoy",
        type: "success",
      });
      actions.resetForm();
    } catch (err) {
      if (err instanceof AxiosError)
        toaster.create({
          title: err?.response?.data.message || "Error in login",
          description: "Try again",
          type: "error",
        });
      console.log(err);
    } finally {
      actions.setSubmitting(false);
    }
  };
  return (
    <Box
      width={{base:"100%",md:"33%"}}
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
        width={{sm:"clamp(200px,80%,350px)",md:"350px"}}
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
            Login to your account
          </Text>
          <p
            style={{
              color: "black",
              letterSpacing: "1px",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            Not have account{" "}
            <Link href={"/auth/signup"} style={{ color: "blue" }}>
              Create One
            </Link>
            ?{" "}
          </p>
        </Box>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <VStack>
                <InputField name="email" type="email" />
                <InputField name="password" type="password" />
              </VStack>
              <button type="submit" className="submit-btn">
                Login
              </button>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default Login;
