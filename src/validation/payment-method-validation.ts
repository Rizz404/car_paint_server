import { z } from "zod";
import { PaymentMethodType, PaymentReusability } from "@prisma/client";

export const createPaymentMethodSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: "Payment method name is required" })
        .min(2, "Name must be at least 2 characters"),
      type: z.nativeEnum(PaymentMethodType).optional(),
      reusability: z.nativeEnum(PaymentReusability).optional(),
      fee: z.coerce
        .number({
          required_error: "Fee is required",
          invalid_type_error: "Fee must be a number",
        })
        .positive("Fee must be a positive number"),
      minimumPayment: z.coerce.number().optional(),
      maximumPayment: z.coerce.number().optional(),
      description: z.string().optional(),
      logoUrl: z.string().optional(),
      isActive: z.boolean().optional(),
      midtransIdentifier: z.string().optional(),
    })
    .strict(),
});

export const updatePaymentMethodSchema = z.object({
  body: createPaymentMethodSchema.shape.body.partial(),
});

export const createManyPaymentMethodSchema = z.object({
  body: z
    .array(createPaymentMethodSchema.shape.body)
    .min(1, "At least one payment method is required"),
});
