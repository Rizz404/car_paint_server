import { z } from "zod";

/* =======================================================
   USER
======================================================= */

/* =======================================================
   USER PROFILE
======================================================= */
export const createUserProfileSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: "User ID is required" }),
    fullname: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const updateUserProfileSchema = z.object({
  body: createUserProfileSchema.shape.body.partial(),
});

export const createManyUserProfileSchema = z.object({
  body: z
    .array(createUserProfileSchema.shape.body)
    .min(1, "At least one user profile is required"),
});

/* =======================================================
   CAR BRAND
======================================================= */
export const createCarBrandSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters"),
    imageUrl: z.any({ required_error: "Logo URL is required" }),
  }),
});

export const updateCarBrandSchema = z.object({
  body: createCarBrandSchema.shape.body.partial(),
});

export const createManyCarBrandsSchema = z.object({
  body: z
    .array(
      z.object({
        name: z
          .string({ required_error: "Name is required" })
          .min(2, "Name must be at least 2 characters"),
        imageUrl: z.any().optional(),
      })
    )
    .min(1, "At least one car brand is required"),
});

/* =======================================================
   CAR MODEL
======================================================= */
export const createCarModelSchema = z.object({
  body: z.object({
    carBrandId: z.string({ required_error: "Car brand ID is required" }),
    name: z
      .string({ required_error: "Car model name is required" })
      .min(2, "Name must be at least 2 characters"),
  }),
});

export const updateCarModelSchema = z.object({
  body: createCarModelSchema.shape.body.partial(),
});

export const createManyCarModelSchema = z.object({
  body: z
    .array(createCarModelSchema.shape.body)
    .min(1, "At least one car model is required"),
});

/* =======================================================
   CAR SERVICE
======================================================= */
export const createCarServiceSchema = z.object({
  body: z.object({
    workshopId: z.string({ required_error: "Workshop ID is required" }),
    name: z
      .string({ required_error: "Service name is required" })
      .min(2, "Name must be at least 2 characters"),
  }),
});

export const updateCarServiceSchema = z.object({
  body: createCarServiceSchema.shape.body.partial(),
});

export const createManyCarServiceSchema = z.object({
  body: z
    .array(createCarServiceSchema.shape.body)
    .min(1, "At least one car service is required"),
});

/* =======================================================
   CAR MODEL COLOR
======================================================= */
export const createCarModelColorSchema = z.object({
  body: z.object({
    carModelId: z.string({ required_error: "Car model ID is required" }),
    name: z
      .string({ required_error: "Color name is required" })
      .min(1, "Name must be at least 1 character"),
  }),
});

export const updateCarModelColorSchema = z.object({
  body: createCarModelColorSchema.shape.body.partial(),
});

export const createManyCarModelColorSchema = z.object({
  body: z
    .array(createCarModelColorSchema.shape.body)
    .min(1, "At least one car model color is required"),
});

/* =======================================================
   CAR MODEL YEAR
======================================================= */
export const createCarModelYearSchema = z.object({
  body: z.object({
    carModelId: z.string({ required_error: "Car model ID is required" }),
    year: z.number({ required_error: "Year is required" }),
  }),
});

export const updateCarModelYearSchema = z.object({
  body: createCarModelYearSchema.shape.body.partial(),
});

export const createManyCarModelYearSchema = z.object({
  body: z
    .array(createCarModelYearSchema.shape.body)
    .min(1, "At least one car model year is required"),
});

/* =======================================================
   USER CAR
======================================================= */
export const createUserCarSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: "User ID is required" }),
    carBrandId: z.string({ required_error: "Car brand ID is required" }),
    carModelId: z.string({ required_error: "Car model ID is required" }),
    carModelColorId: z.string({
      required_error: "Car model color ID is required",
    }),
    carModelYearId: z.string({
      required_error: "Car model year ID is required",
    }),
    licensePlate: z.string({ required_error: "License plate is required" }),
    imageUrls: z
      .array(z.string(), { required_error: "Image URLs are required" })
      .min(1, "At least one image URL is required"),
  }),
});

export const updateUserCarSchema = z.object({
  body: createUserCarSchema.shape.body.partial(),
});

export const createManyUserCarSchema = z.object({
  body: z
    .array(createUserCarSchema.shape.body)
    .min(1, "At least one user car is required"),
});

/* =======================================================
   WORKSHOP
======================================================= */
export const createWorkshopSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Workshop name is required" })
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format"),
    phoneNumber: z.string().optional(),
    address: z.string({ required_error: "Address is required" }),
    latitude: z.number({ required_error: "Latitude is required" }),
    longitude: z.number({ required_error: "Longitude is required" }),
    carBrandId: z.string({ required_error: "Car brand ID is required" }),
  }),
});

export const updateWorkshopSchema = z.object({
  body: createWorkshopSchema.shape.body.partial(),
});

export const createManyWorkshopSchema = z.object({
  body: z
    .array(createWorkshopSchema.shape.body)
    .min(1, "At least one workshop is required"),
});

/* =======================================================
   PAYMENT METHOD
======================================================= */
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

/* =======================================================
   ORDER
======================================================= */
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

/* =======================================================
   TRANSACTION
======================================================= */
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

/* =======================================================
   E-TICKET
======================================================= */
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
