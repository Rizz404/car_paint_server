import { z } from "zod";
import { PaymentMethodType, PaymentReusability } from "@prisma/client";
import { fileSchema } from "@/utils/file-vallidation";

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
      callbackUrl: z.string().url().optional(),
      successReturnUrl: z.string().url().optional(),
      failureReturnUrl: z.string().url().optional(),
      bankCode: z.string().optional(),
      channelCode: z.string().optional(),
      storeName: z.string().optional(),
    })
    .strict(),
  file: fileSchema,
});

export const updatePaymentMethodSchema = z.object({
  body: createPaymentMethodSchema.shape.body.partial(),
});

export const createManyPaymentMethodSchema = z.object({
  body: z
    .array(
      createPaymentMethodSchema
        .omit({ file: true })
        .shape.body.extend({ logoUrl: z.string().optional() })
    )
    .min(1, "At least one payment method is required"),
});
