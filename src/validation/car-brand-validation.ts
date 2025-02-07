import { z } from "zod";

export const createCarBrandSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must be at least 2 characters"),
    logo: z.any({
      required_error: "Logo URL is required",
    }),
    // .url("Invalid logo URL"),
  }),
});

export const updateCarBrandSchema = z.object({
  body: createCarBrandSchema.shape.body.partial(),
});

export const createManyCarBrandSchema = z.object({
  body: z
    .array(createCarBrandSchema.shape.body)
    .min(1, "At least one car service is required"),
});
