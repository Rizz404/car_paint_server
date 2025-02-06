import { z } from "zod";

export const createCarServiceSchema = z.object({
  body: z.object({
    workshopId: z.string({ required_error: "Workshop ID is required" }),
    name: z
      .string({ required_error: "Service name is required" })
      .min(2, "Name must be at least 2 characters"),
  }),
});

export const updateCarServiceSchema = z.object({
  body: createCarServiceSchema.shape.body.partial(),
});

export const createManyCarServiceSchema = z.object({
  body: z
    .array(createCarServiceSchema.shape.body)
    .min(1, "At least one car service is required"),
});
