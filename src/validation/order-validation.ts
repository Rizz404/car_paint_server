import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: "User ID is required" }),
    userCarId: z.string({ required_error: "User car ID is required" }),
    workshopId: z.string({ required_error: "Workshop ID is required" }),
    workStatus: z.enum(
      [
        "INSPECTION",
        "PUTTY",
        "SURFACER",
        "APPLICATIONCOLORBASE",
        "APPLICATIONCLEARCOAT",
        "POLISHING",
        "FINALQC",
        "DONE",
      ],
      { required_error: "Work status is required" }
    ),
    orderStatus: z.enum(["PENDING", "ACCEPTED", "CANCELLED"]).optional(),
    note: z.string({ required_error: "Note is required" }),
    totalPrice: z.number({ required_error: "Total price is required" }),
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
