import { z } from "zod";

export const createWorkshopSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters"),
    address: z
      .string({ required_error: "Address is required" })
      .min(5, "Address must be at least 5 characters"),
    latitude: z
      .number({ required_error: "Latitude is required" })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z
      .number({ required_error: "Longitude is required" })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    brandId: z.string({ required_error: "Brand ID is required" }),
  }),
});

export const updateWorkshopSchema = z.object({
  body: createWorkshopSchema.shape.body.partial(),
});
