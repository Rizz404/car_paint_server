import { z } from "zod";

export const createETicketSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: "User ID is required" }),
    orderId: z.string({ required_error: "Order ID is required" }),
    ticketNumber: z.number({ required_error: "Ticket number is required" }),
  }),
});

export const updateETicketSchema = z.object({
  body: createETicketSchema.shape.body.partial(),
});

export const createManyETicketSchema = z.object({
  body: z
    .array(createETicketSchema.shape.body)
    .min(1, "At least one e-ticket is required"),
});
