import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: "User ID is required" }),
    paymentMethodId: z.string({
      required_error: "Payment method ID is required",
    }),
    orderId: z.string({ required_error: "Order ID is required" }),
    adminFee: z.number({ required_error: "Admin fee is required" }),
    paymentMethodFee: z.number({
      required_error: "Payment method fee is required",
    }),
    totalPrice: z.number({ required_error: "Total price is required" }),
    paymentStatus: z.enum(["PENDING", "SUCCESS", "CANCELLED"]).optional(),
  }),
});

export const updateTransactionSchema = z.object({
  body: createTransactionSchema.shape.body.partial(),
});

export const createManyTransactionSchema = z.object({
  body: z
    .array(createTransactionSchema.shape.body)
    .min(1, "At least one transaction is required"),
});
