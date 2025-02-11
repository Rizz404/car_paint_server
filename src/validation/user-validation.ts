import { Role } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(3, "Username must be at least 3 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    profileImage: z.string().optional(),
    role: z.nativeEnum(Role).optional().default(Role.USER),
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

export const updateCurrentUserSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .optional(),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .optional(),
    fullname: z.string().optional(),
    phoneNumber: z
      .string()
      .regex(/^(\+62|0)8[1-9][0-9]{6,9}$/, "Invalid phone number format")
      .optional(),
    address: z.string().optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    profileImage: z.string().url().optional(),
  }),
});

export const updateCurrentUserPasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "New password must be at least 6 characters"),
  }),
});
