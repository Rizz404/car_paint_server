import { z } from "zod";

export const carServiceSchema = z.object({
  carServiceId: z.string().min(1, "Car service ID is required"),
});

export const createOrderSchema = z.object({
  body: z
    .object({
      userCarId: z.string().min(1, "User car ID is required"),
      workshopId: z.string().min(1, "Workshop ID is required"),
      paymentMethodId: z.string().min(1, "Payment Method ID is required"),
      note: z.string().max(1000, "Max 1000 characters").optional(),
      carServices: z
        .array(carServiceSchema)
        .min(1, "Minimal 1 layanan harus dipilih"),
    })
    .strict(),
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

export const createManyOrderSchema = z.object({
  body: z.array(
    createOrderSchema.shape.body.extend({
      userId: z.string().min(1, "User ID is required"),
      transactionId: z.string().min(1, "Transaction ID is required"),
    })
  ),
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
