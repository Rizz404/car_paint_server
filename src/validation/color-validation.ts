import { z } from "zod";

export const createColorSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "Name is required",
        })
        .min(3, "Name must be at least 3 characters"),
      code: z.string().optional(),
    })
    .strict(),
});

export const updateColorSchema = z.object({
  body: createColorSchema.shape.body.partial(),
});

export const createManyColorSchema = z.object({
  body: z
    .array(createColorSchema.shape.body)
    .min(1, "At least one car service is required"),
});
