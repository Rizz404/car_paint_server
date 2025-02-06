import { z } from "zod";

export const createPaymentMethodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Payment method name is required" })
      .min(2, "Name must be at least 2 characters"),
    fee: z.number({ required_error: "Fee is required" }),
  }),
});

export const updatePaymentMethodSchema = z.object({
  body: createPaymentMethodSchema.shape.body.partial(),
});

export const createManyPaymentMethodSchema = z.object({
  body: z
    .array(createPaymentMethodSchema.shape.body)
    .min(1, "At least one payment method is required"),
});
