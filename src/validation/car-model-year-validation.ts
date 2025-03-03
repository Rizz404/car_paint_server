import { z } from "zod";

export const createCarModelYearSchema = z.object({
  body: z
    .object({
      carModelId: z.string({ required_error: "Car model ID is required" }),
      year: z.number({ required_error: "Year is required" }),
    })
    .strict(),
});

export const updateCarModelYearSchema = z.object({
  body: createCarModelYearSchema.shape.body.partial(),
});

export const createManyCarModelYearSchema = z.object({
  body: z
    .array(createCarModelYearSchema.shape.body)
    .min(1, "At least one car model year is required"),
});
