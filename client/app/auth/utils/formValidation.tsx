import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required")
    .test(
      "no-empty-spaces",
      "Email cannot be empty or only spaces",
      (value) => (value && value.trim().length > 0) || undefined
    ),
  password: Yup.string()
    .min(7, "Password must be at least 7 characters")
    .required("Password is required")
    .test(
      "no-empty-spaces",
      "Password cannot be empty or only spaces",
      (value) => (value && value.trim().length > 0) || undefined
    ),
});

export const signupSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required")
    .test(
      "no-empty-spaces",
      "Email cannot be empty or only spaces",
      (value) => (value && value.trim().length > 0) || undefined
    ),
  name: Yup.string()
    .min(2, "Name must contain 2 characters")
    .max(25, "Name is too long")
    .required("Name is required")
    .test(
      "no-empty-spaces",
      "Name cannot be empty or only spaces",
      (value) => (value && value.trim().length > 0) || undefined
    ),
  password: Yup.string()
    .min(7, "Password must be at least 7 characters")
    .required("Password is required")
    .test(
      "no-empty-spaces",
      "Password cannot be empty or only spaces",
      (value) => (value && value.trim().length > 0) || undefined
    ),
});
