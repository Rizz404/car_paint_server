import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z
    .object({
      paymentMethodId: z.string({
        required_error: "Payment method ID is required",
      }),
      orderId: z.string({ required_error: "Order ID is required" }),
    })
    .strict(),
});

export const updateTransactionSchema = z.object({
  body: createTransactionSchema.shape.body.partial(),
});

export const createManyTransactionSchema = z.object({
  body: z
    .array(createTransactionSchema.shape.body)
    .min(1, "At least one transaction is required"),
});
