import { z } from "zod";

export const createCarModelColorSchema = z.object({
  body: z
    .object({
      carModelId: z.string({ required_error: "Car model ID is required" }),
      colorId: z.string({ required_error: "Color ID is required" }),
    })
    .strict(),
});

export const updateCarModelColorSchema = z.object({
  body: createCarModelColorSchema.shape.body.partial(),
});

export const createManyCarModelColorSchema = z.object({
  body: z
    .array(createCarModelColorSchema.shape.body)
    .min(1, "At least one car model is required"),
});
