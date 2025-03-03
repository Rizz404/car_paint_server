import { z } from "zod";

export const createCarModelSchema = z.object({
  body: z
    .object({
      carBrandId: z.string({ required_error: "Car brand ID is required" }),
      name: z
        .string({ required_error: "Car model name is required" })
        .min(2, "Name must be at least 2 characters"),
    })
    .strict(),
});

export const updateCarModelSchema = z.object({
  body: createCarModelSchema.shape.body.partial(),
});

export const createManyCarModelSchema = z.object({
  body: z
    .array(createCarModelSchema.shape.body)
    .min(1, "At least one car model is required"),
});
