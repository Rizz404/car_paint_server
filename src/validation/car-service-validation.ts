import { z } from "zod";

export const createCarServiceSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: "Service name is required" })
        .min(2, "Name must be at least 2 characters"),
      price: z.coerce
        .number({
          required_error: "Price is required",
          invalid_type_error: "Price must be a number",
        })
        .positive("Price must be a positive number"),
    })
    .strict(),
});

export const updateCarServiceSchema = z.object({
  body: createCarServiceSchema.shape.body.partial(),
});

export const createManyCarServiceSchema = z.object({
  body: z
    .array(createCarServiceSchema.shape.body)
    .min(1, "At least one car service is required"),
});
