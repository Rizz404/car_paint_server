import { z } from "zod";

export const carServiceSchema = z.object({
  carServiceId: z.string().min(1, "Car service ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  body: z.object({
    userCarId: z.string().min(1, "User car ID is required"),
    workshopId: z.string().min(1, "Workshop ID is required"),
    note: z.string().optional(),
    carServices: z
      .array(carServiceSchema)
      .min(1, "At least one car service is required"),
    paymentMethodId: z.string().min(1, "Payment method ID is required"),
  }),
});

export const updateOrderSchema = z.object({
  body: createOrderSchema.shape.body.partial(),
});

export const createManyOrderSchema = z.object({
  body: z
    .array(createOrderSchema.shape.body)
    .min(1, "At least one order is required"),
});
