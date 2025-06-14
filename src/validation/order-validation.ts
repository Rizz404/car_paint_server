import { z } from "zod";

export const carServiceSchema = z.object({
  carServiceId: z.string().min(1, "Car service ID is required"),
});

export const createOrderSchema = z.object({
  body: z
    .object({
      colorId: z.string().optional(),
      carModelId: z.string().optional(),
      carModelColorId: z.string().optional(),
      workshopId: z.string().min(1, "Workshop ID is required"),
      paymentMethodId: z.string().min(1, "Payment Method ID is required"),
      note: z.string().max(1000, "Max 1000 characters").optional(),
      carServices: z
        .array(carServiceSchema)
        .min(1, "Minimal 1 layanan harus dipilih"),
      cardTokenId: z.string().optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (data.carModelColorId) {
        // Jika carModelColorId ada, maka colorId dan carModelId tidak boleh ada
        if (data.colorId || data.carModelId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cannot combine carModelColorId with colorId/carModelId",
            path: ["carModelColorId"],
          });
        }
        return;
      }

      // Jika carModelColorId tidak ada, maka colorId dan carModelId harus ada keduanya
      if (!data.colorId || !data.carModelId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Either carModelColorId or both colorId and carModelId are required",
          path: ["colorId"],
        });
      }
    }),
});

export const createManyOrderSchema = z.object({
  body: z.array(
    z
      .object({
        carModelColorId: z.string().optional(),
        colorId: z.string().optional(),
        carModelId: z.string().optional(),
        workshopId: z.string().min(1, "Workshop ID is required"),
        paymentMethodId: z.string().min(1, "Payment Method ID is required"),
        note: z.string().max(1000, "Max 1000 characters").optional(),
        carServices: z
          .array(carServiceSchema)
          .min(1, "Minimal 1 layanan harus dipilih"),
        userId: z.string().min(1, "User ID is required"),
        transactionId: z.string().min(1, "Transaction ID is required"),
      })
      .superRefine((data, ctx) => {
        if (data.carModelColorId) {
          // Jika carModelColorId ada, maka colorId dan carModelId tidak boleh ada
          if (data.colorId || data.carModelId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Cannot combine carModelColorId with colorId/carModelId",
              path: ["carModelColorId"],
            });
          }
          return;
        }

        // Jika carModelColorId tidak ada, maka colorId dan carModelId harus ada keduanya
        if (!data.colorId || !data.carModelId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Either carModelColorId or both colorId and carModelId are required",
            path: ["colorId"],
          });
        }
      })
  ),
});

export const updateOrderSchema = z.object({
  body: z
    .object({
      note: z.string().max(1000, "Max 1000 characters").optional(),
      orderStatus: z
        .enum(["DRAFT", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED"])
        .optional(),
      workStatus: z
        .enum([
          "QUEUED",
          "INSPECTION",
          "PUTTY",
          "SURFACER",
          "APPLICATION_COLR_BASE",
          "APPLICATION_CLEAR_COAT",
          "POLISHING",
          "FINAL_QC",
          "COMPLETED",
          "CANCELLED",
        ])
        .optional(),
    })
    .strict(),
});

export const cancelOrderSchema = z.object({
  body: z
    .object({
      reason: z
        .enum([
          "CUSTOMER_REQUEST",
          "WORKSHOP_UNAVAILABLE",
          "SERVICE_UNAVAILABLE",
          "SCHEDULING_CONFLICT",
          "PAYMENT_ISSUE",
          "VEHICLE_ISSUE",
          "PRICE_DISAGREEMENT",
          "WORKSHOP_OVERBOOKED",
          "DUPLICATE_ORDER",
          "PARTS_UNAVAILABLE",
          "CUSTOMER_NO_SHOW",
          "FORCE_MAJEURE",
          "SERVICE_INCOMPATIBILITY",
          "OTHER",
        ])
        .optional(),
      notes: z.string().max(500).optional(),
    })
    .strict(),
});
