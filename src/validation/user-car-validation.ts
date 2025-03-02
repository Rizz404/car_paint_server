// src/validations/user-car.validation.ts
import { filesArraySchema } from "@/utils/file-vallidation";
import { z } from "zod";

export const createUserCarSchema = z.object({
  body: z
    .object({
      carModelYearColorId: z.string().optional(),
      colorId: z.string().optional(),
      carModelYearId: z.string().optional(),
      licensePlate: z.string({ required_error: "License plate is required" }),
    })
    .superRefine((data, ctx) => {
      // Validasi kombinasi input yang diperbolehkan
      if (data.carModelYearColorId) {
        if (data.colorId || data.carModelYearId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Cannot combine carModelYearColorId with colorId/carModelYearId",
            path: ["carModelYearColorId"],
          });
        }
        return;
      }

      if (!data.colorId && !data.carModelYearId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Either carModelYearColorId or both colorId and carModelYearId are required",
          path: ["colorId"],
        });
        return;
      }

      if (data.colorId && !data.carModelYearId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "carModelYearId is required when using colorId",
          path: ["carModelYearId"],
        });
      }

      if (data.carModelYearId && !data.colorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "colorId is required when using carModelYearId",
          path: ["colorId"],
        });
      }
    }),
  files: filesArraySchema.optional(),
});

export const updateUserCarSchema = z.object({
  body: z
    .object({
      carModelYearColorId: z.string().optional(),
      colorId: z.string().optional(),
      carModelYearId: z.string().optional(),
      licensePlate: z.string().optional(),
    })
    .partial()
    .superRefine((data: Record<string, any>, ctx: z.RefinementCtx) => {
      // Validasi untuk update partial
      if (data.carModelYearColorId && (data.colorId || data.carModelYearId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Cannot combine carModelYearColorId with colorId/carModelYearId",
          path: ["carModelYearColorId"],
        });
      }

      if (data.colorId && !data.carModelYearId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "carModelYearId is required when updating colorId",
          path: ["carModelYearId"],
        });
      }

      if (data.carModelYearId && !data.colorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "colorId is required when updating carModelYearId",
          path: ["colorId"],
        });
      }
    }),
});

export const createManyUserCarSchema = z.object({
  body: z
    .array(
      z.object({
        carModelYearColorId: z.string().optional(),
        colorId: z.string().optional(),
        carModelYearId: z.string().optional(),
        licensePlate: z.string({ required_error: "License plate is required" }),
      })
    )
    .superRefine((items, ctx) => {
      items.forEach((item, index) => {
        if (item.carModelYearColorId && (item.colorId || item.carModelYearId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Cannot combine carModelYearColorId with colorId/carModelYearId",
            path: [index, "carModelYearColorId"],
          });
        }

        if (
          !item.carModelYearColorId &&
          !(item.colorId && item.carModelYearId)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Either carModelYearColorId or both colorId and carModelYearId are required",
            path: [index],
          });
        }
      });
    }),
});

export const addUserCarImageSchema = z.object({
  files: filesArraySchema,
});
