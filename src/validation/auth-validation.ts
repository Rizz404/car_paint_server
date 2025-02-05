import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must be at least 2 characters"),
    imageUrl: z.string({
      required_error: "Logo URL is required",
    }),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must be at least 2 characters"),
    imageUrl: z.string({
      required_error: "Logo URL is required",
    }),
  }),
});
