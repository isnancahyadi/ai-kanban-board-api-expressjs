import z from "zod";

export const RegisterSchema = z
  .object({
    name: z
      .string({
        error: (issue) => (issue.input === undefined ? "Name is required" : "Invalid input"),
      })
      .regex(
        /^[a-zA-Z\s\-']+$/,
        "Name may only contain letters, spaces, and special characters like (') and (-)",
      ),
    email: z.email({
      error: (issue) =>
        issue.input === undefined
          ? "Email address is required"
          : "Please provide a valid email address",
    }),
    password: z
      .string({
        error: (issue) => (issue.input === undefined ? "Password is required" : "Invalid input"),
      })
      .min(8, "Password must be at least 8 characters long")
      .max(16, "Password must not exceed 16 character")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirm_password: z.string({
      error: (issue) =>
        issue.input === undefined ? "Password confirmation is required" : "Invalid input",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password confirmation does not match the password",
    path: ["confirmPassword"],
  })
  .required();

export type RegisterInputType = z.infer<typeof RegisterSchema>;
