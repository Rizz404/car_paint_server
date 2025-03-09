import { z } from "zod";

export const createCarModelYearColorSchema = z.object({
  body: z
    .object({
      carModelYearId: z.string({
        required_error: "Car model year ID is required",
      }),
      colorId: z.string({ required_error: "Color ID is required" }),
    })
    .strict(),
});

export const updateCarModelYearColorSchema = z.object({
  body: createCarModelYearColorSchema.shape.body.partial(),
});

export const createManyCarModelYearColorSchema = z.object({
  body: z
    .array(createCarModelYearColorSchema.shape.body)
    .min(1, "At least one car model year is required"),
});
