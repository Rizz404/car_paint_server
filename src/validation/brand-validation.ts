import { z } from "zod";

export const createBrandSchema = z.object({
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

export const updateBrandSchema = z.object({
  body: createBrandSchema.shape.body.partial(),
});

export const createManyBrandsSchema = z.object({
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
    .min(1, "At least one brand is required"),
});
