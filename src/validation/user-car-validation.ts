import { filesArraySchema } from "@/utils/file-vallidation";
import { z } from "zod";

export const createUserCarSchema = z.object({
  body: z.object({
    carModelYearColorId: z.string({
      required_error: "Car Model Year Color ID is required",
    }),
    licensePlate: z.string({ required_error: "License plate is required" }),
  }),
  files: filesArraySchema.optional(),
});

export const updateUserCarSchema = z.object({
  body: createUserCarSchema.omit({ files: true }).shape.body.partial(),
});

export const createManyUserCarSchema = z.object({
  body: z
    .array(createUserCarSchema.omit({ files: true }).shape.body)
    .min(1, "At least one user car is required"),
});

export const addUserCarImageSchema = z.object({
  files: filesArraySchema,
});
