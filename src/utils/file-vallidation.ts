import { z } from "zod";

// File type validation
const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Single file validation schema
export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z
    .string()
    .refine((type) => ALLOWED_FILE_TYPES.includes(type as any), {
      message: `File type must be one of: ${ALLOWED_FILE_TYPES.join(", ")}`,
    }),
  size: z
    .number()
    .max(
      MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    ),
  buffer: z.instanceof(Buffer),
});

// Array of files validation schema
export const filesArraySchema = z.array(fileSchema).min(1).max(5);
