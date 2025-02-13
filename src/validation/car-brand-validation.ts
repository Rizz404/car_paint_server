import { z } from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Base schema untuk file validasi
const fileSchema = z.object({
  originalname: z.string(),
  mimetype: z.string().refine((type) => ACCEPTED_IMAGE_TYPES.includes(type), {
    message: "File must be an image (jpeg, jpg, png, webp)",
  }),
  size: z.number().max(MAX_FILE_SIZE, "File size must be less than 5MB"),
});

// Base schema untuk car brand
const carBrandBaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z
    .string()
    .min(3, "Country must be at least 3 characters")
    .optional(),
});

// Schema untuk create single car brand
export const createCarBrandSchema = z.object({
  body: carBrandBaseSchema.extend({
    logo: fileSchema,
  }),
});

// Schema untuk update car brand
export const updateCarBrandSchema = z.object({
  body: carBrandBaseSchema
    .extend({
      logo: fileSchema.optional(),
    })
    .partial(),
});

// Schema untuk create multiple car brands
export const createManyCarBrandSchema = z.object({
  body: z.object({
    items: z
      .array(
        carBrandBaseSchema.extend({
          logo: fileSchema,
        })
      )
      .min(1, "At least one car brand is required"),
  }),
});
