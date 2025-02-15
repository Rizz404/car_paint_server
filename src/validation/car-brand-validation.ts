import { fileSchema } from "@/utils/file-vallidation";
import { z } from "zod";

export const createCarBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    country: z
      .string()
      .min(3, "Country must be at least 3 characters")
      .optional(),
  }),
  file: fileSchema,
});

export const updateCarBrandSchema = z.object({
  body: createCarBrandSchema.shape.body.partial(),
});

export const createManyCarBrandSchema = z.object({
  body: z
    .array(
      createCarBrandSchema
        .omit({ file: true })
        .shape.body.extend({ logo: z.string().optional() })
    )
    .min(1, "At least one car brand is required"),
});
