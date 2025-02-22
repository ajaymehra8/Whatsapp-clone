import { Field } from "formik";
import { Box, Input, Text } from "@chakra-ui/react";

interface InputFieldProps {
  name: string;
  type?: string;
}

const InputField = ({ name, type = "text" }: InputFieldProps) => {
  return (
    <Field name={name}>
      {({ field, form }: any) => (
        <Box width={"100%"} minH={"50px"}>
          <Input
            {...field}
            id={name}
            type={type}
            color={"black"}
            _placeholder={{ color: "gray" }}
            placeholder={`Enter your ${name}`}
            padding={"0 10px"}
            borderRadius={"10px"}
            _focus={{border:"1px solid black",outline:"none"}}
          />
          {form.errors[name] && form.touched[name] && (
            <Text color="red.500" mt={1} fontSize="sm" fontWeight={500}>
              {form.errors[name]}.
            </Text>
          )}
        </Box>
      )}
    </Field>
  );
};

export default InputField;
