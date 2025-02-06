import { z } from "zod";

export const createUserCarSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: "User ID is required" }),
    carBrandId: z.string({ required_error: "Car brand ID is required" }),
    carModelId: z.string({ required_error: "Car model ID is required" }),
    carModelColorId: z.string({
      required_error: "Car model color ID is required",
    }),
    carModelYearId: z.string({
      required_error: "Car model year ID is required",
    }),
    licensePlate: z.string({ required_error: "License plate is required" }),
    imageUrls: z
      .array(z.string(), { required_error: "Image URLs are required" })
      .min(1, "At least one image URL is required"),
  }),
});

export const updateUserCarSchema = z.object({
  body: createUserCarSchema.shape.body.partial(),
});

export const createManyUserCarSchema = z.object({
  body: z
    .array(createUserCarSchema.shape.body)
    .min(1, "At least one user car is required"),
});
