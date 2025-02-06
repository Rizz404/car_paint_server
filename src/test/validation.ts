import { z } from "zod";

/* =======================================================
   USER
======================================================= */

/* =======================================================
   USER PROFILE
======================================================= */
export const createUserProfileSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: "User ID is required" }),
    fullname: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const updateUserProfileSchema = z.object({
  body: createUserProfileSchema.shape.body.partial(),
});

export const createManyUserProfileSchema = z.object({
  body: z
    .array(createUserProfileSchema.shape.body)
    .min(1, "At least one user profile is required"),
});

/* =======================================================
   CAR BRAND
======================================================= */
export const createCarBrandSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters"),
    imageUrl: z.any({ required_error: "Logo URL is required" }),
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
          .string({ required_error: "Name is required" })
          .min(2, "Name must be at least 2 characters"),
        imageUrl: z.any().optional(),
      })
    )
    .min(1, "At least one car brand is required"),
});

/* =======================================================
   CAR MODEL
======================================================= */

/* =======================================================
   CAR SERVICE
======================================================= */

/* =======================================================
   CAR MODEL COLOR
======================================================= */

/* =======================================================
   CAR MODEL YEAR
======================================================= */

/* =======================================================
   USER CAR
======================================================= */

/* =======================================================
   WORKSHOP
======================================================= */

/* =======================================================
   PAYMENT METHOD
======================================================= */

/* =======================================================
   ORDER
======================================================= */

/* =======================================================
   TRANSACTION
======================================================= */

/* =======================================================
   E-TICKET
======================================================= */
