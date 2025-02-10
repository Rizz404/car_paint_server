import { z } from "zod";

export const createWorkshopSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Workshop name is required" })
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    phoneNumber: z.string().optional(),
    address: z.string({ required_error: "Address is required" }),
    latitude: z.number({ required_error: "Latitude is required" }),
    longitude: z.number({ required_error: "Longitude is required" }),
  }),
});

export const updateWorkshopSchema = z.object({
  body: createWorkshopSchema.shape.body.partial(),
});

export const createManyWorkshopSchema = z.object({
  body: z
    .array(createWorkshopSchema.shape.body)
    .min(1, "At least one workshop is required"),
});
