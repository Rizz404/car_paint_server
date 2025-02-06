import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(2, "Username must be at least 2 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    profileImage: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: createUserSchema.shape.body.partial(),
});

export const createManyUserSchema = z.object({
  body: z
    .array(createUserSchema.shape.body)
    .min(1, "At least one user is required"),
});
