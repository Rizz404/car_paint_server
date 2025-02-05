import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(2, "Username must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});
