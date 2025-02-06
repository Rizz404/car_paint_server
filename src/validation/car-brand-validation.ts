import { z } from "zod";

export const createCarBrandSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must be at least 2 characters"),
    imageUrl: z.any({
      required_error: "Logo URL is required",
    }),
    // .url("Invalid imageUrl URL"),
  }),
});

export const updateCarBrandSchema = z.object({
  body: createCarBrandSchema.shape.body.partial(),
});

export const createManyCarBrandsSchema = z.object({
  body: z
    .array(
      z.object({
        name: z
          .string({
            required_error: "Name is required",
          })
          .min(2, "Name must be at least 2 characters"),
        imageUrl: z.any().optional(),
      })
    )
    .min(1, "At least one carCarBrand is required"),
});
