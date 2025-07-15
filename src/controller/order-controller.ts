import prisma from "@/configs/database";
import env from "@/configs/environment";
import { midtransCoreApi } from "@/configs/midtrans";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import {
  mapToMidtransFraudStatus,
  mapToMidtransTransactionStatus,
} from "@/utils/midtrans";
import {
  createOrderStatusNotification,
  createWorkStatusNotification,
} from "@/utils/notification-handler";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { createOrderSchema } from "@/validation/order-validation";
import {
  Cancellation,
  CancellationReason,
  MidtransFraudStatus,
  MidtransTransactionStatus,
  Order,
  OrderStatus,
  PaymentDetail,
  Prisma,
  WorkStatus,
} from "@prisma/client";
import { RequestHandler } from "express";
import { messaging } from "firebase-admin";
import {
  CoreApiChargeParameter,
  CustomerDetails,
  ItemDetails,
  CoreApiChargeResponse,
} from "midtrans-client";
import { z } from "zod";

type CreateOrderDTO = z.infer<typeof createOrderSchema>["body"];

// *======================= POST =======================*
export const createOrderWithMidtrans: RequestHandler = async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const {
      carServices,
      carModelId,
      colorId,
      carModelColorId,
      workshopId,
      paymentMethodId,
      note,
      plateNumber,
      cardTokenId,
    }: CreateOrderDTO = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        userProfile: {
          select: {
            fullname: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }
    if (!user.userProfile || !user.userProfile.phoneNumber) {
      return createErrorResponse(
        res,
        "User profile or phone number is required",
        400
      );
    }

    let finalCarModelColorId: string;

    if (carModelColorId) {
      const existingCarModelColor = await prisma.carModelColor.findUnique({
        where: { id: carModelColorId },
      });

      if (!existingCarModelColor) {
        return createErrorResponse(res, "Car model color not found", 404);
      }

      finalCarModelColorId = carModelColorId;
    } else if (carModelId && colorId) {
      let carModelColor = await prisma.carModelColor.findUnique({
        where: {
          carModelId_colorId: { carModelId, colorId },
        },
      });

      if (!carModelColor) {
        const [carModel, color] = await Promise.all([
          prisma.carModel.findUnique({ where: { id: carModelId } }),
          prisma.color.findUnique({ where: { id: colorId } }),
        ]);

        if (!carModel) {
          return createErrorResponse(res, "Car model not found", 404);
        }
        if (!color) {
          return createErrorResponse(res, "Color not found", 404);
        }

        carModelColor = await prisma.carModelColor.create({
          data: { carModelId, colorId },
        });
      }

      finalCarModelColorId = carModelColor.id;
    } else {
      return createErrorResponse(
        res,
        "Either carModelColorId or both carModelId and colorId are required",
        400
      );
    }

    const carServiceIds = carServices.map((service) => service.carServiceId);
    const carServicesData = await prisma.carService.findMany({
      where: { id: { in: carServiceIds } },
      select: { id: true, name: true, price: true },
    });
    if (carServicesData.length !== carServiceIds.length) {
      const missingIds = carServiceIds.filter(
        (id) => !carServicesData.some((cs) => cs.id === id)
      );
      return createErrorResponse(
        res,
        `Missing car services: ${missingIds.join(", ")}`,
        404
      );
    }
    const orderSubtotalPrice = carServicesData.reduce(
      (sum, service) => sum.add(service.price),
      new Prisma.Decimal(0)
    );

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
    }
    if (!paymentMethod.isActive) {
      return createErrorResponse(res, "Payment method is not active", 400);
    }
    if (!paymentMethod.midtransIdentifier) {
      return createErrorResponse(
        res,
        "Payment method configuration for Midtrans is missing",
        500
      );
    }

    // Validate Credit Card Token (if relevant)
    if (paymentMethod.midtransIdentifier === "credit_card" && !cardTokenId) {
      return createErrorResponse(
        res,
        "Card Token ID is required for credit card payments",
        400
      );
    }

    const adminFee = new Prisma.Decimal(paymentMethod.fee ?? 0);
    const transactionTotalPrice = orderSubtotalPrice.add(adminFee);
    if (transactionTotalPrice.lessThan(paymentMethod.minimumPayment)) {
      return createErrorResponse(
        res,
        `Minimum payment amount is ${paymentMethod.minimumPayment}`,
        400
      );
    }
    if (transactionTotalPrice.greaterThan(paymentMethod.maximumPayment)) {
      return createErrorResponse(
        res,
        `Maximum payment amount is ${paymentMethod.maximumPayment}`,
        400
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            userId: user.id,
            paymentMethodId: paymentMethod.id,
            adminFee,
            totalPrice: transactionTotalPrice,
            order: {
              create: {
                userId: user.id,
                carModelColorId: finalCarModelColorId, // Menggunakan finalCarModelColorId
                workshopId,
                plateNumber,
                note,
                subtotalPrice: orderSubtotalPrice,
                carServices: {
                  connect: carServicesData.map(({ id }) => ({ id })),
                },
              },
            },
          },
          include: { order: { select: { id: true } } },
        });

        const midtransOrderId = transaction.id;

        const customerDetails: CustomerDetails = {
          first_name:
            user.userProfile?.fullname?.split(" ")[0] ?? user.username,
          last_name:
            user.userProfile?.fullname?.split(" ").slice(1).join(" ") ||
            undefined,
          email: user.email,
          phone: user.userProfile!.phoneNumber!,
        };

        const itemDetails: ItemDetails[] = carServicesData.map((service) => ({
          id: service.id,
          price: Number(service.price),
          quantity: 1,
          name: service.name.substring(0, 50),
          category: "Car Service",
        }));
        if (adminFee.greaterThan(0)) {
          itemDetails.push({
            id: "ADMIN_FEE",
            price: Number(adminFee),
            quantity: 1,
            name: "Biaya Admin",
          });
        }

        let paymentParameter: CoreApiChargeParameter;

        const baseParameter: Omit<
          CoreApiChargeParameter,
          | "payment_type"
          | "credit_card"
          | "bank_transfer"
          | "echannel"
          | "gopay"
          | "shopeepay"
          | "cstore"
          | "qris"
          | "dana"
          | "akulaku"
          | "kredivo"
        > = {
          transaction_details: {
            order_id: midtransOrderId,
            gross_amount: Number(transactionTotalPrice),
          },
          customer_details: customerDetails,
          item_details: itemDetails,
          expiry: {
            unit: "day",
            duration: 2,
          },
        };

        switch (paymentMethod.midtransIdentifier) {
          case "credit_card":
            paymentParameter = {
              ...baseParameter,
              payment_type: "credit_card",
              credit_card: {
                token_id: cardTokenId!,
                authentication: true,
              },
            };
            break;
          case "bca_va":
          case "bni_va":
          case "bri_va":
          case "permata_va":
          case "cimb_va":
          case "bsi_va":
            const bankCode = paymentMethod.midtransIdentifier.split("_")[0];
            paymentParameter = {
              ...baseParameter,
              payment_type: "bank_transfer",
              bank_transfer: {
                bank: bankCode.toUpperCase(),
              },
            };
            break;
          case "mandiri_va":
          case "echannel":
            paymentParameter = {
              ...baseParameter,
              payment_type: "echannel",
              echannel: {
                bill_info1: `Order ID: ${midtransOrderId}`,
                bill_info2: `Pembayaran Jasa Mobil ${user.username}`,
              },
            };
            break;
          case "gopay":
            paymentParameter = {
              ...baseParameter,
              payment_type: "gopay",
              gopay: { enable_callback: true, callback_url: env.CALLBACK_URL },
            };
            break;
          case "qris":
            paymentParameter = {
              ...baseParameter,
              payment_type: "qris",
            };
            break;
          case "shopeepay":
            paymentParameter = {
              ...baseParameter,
              payment_type: "shopeepay",
              shopeepay: {
                callback_url: env.CALLBACK_URL,
              },
            };
            break;
          case "alfamart":
          case "indomaret":
            paymentParameter = {
              ...baseParameter,
              payment_type: "cstore",
              cstore: {
                store: paymentMethod.midtransIdentifier,
                message: `Pembayaran Order ${midtransOrderId}`,
              },
            };
            break;
          case "dana":
            paymentParameter = {
              ...baseParameter,
              payment_type: "dana",
              dana: { callback_url: env.CALLBACK_URL },
            };
            break;
          case "akulaku":
            paymentParameter = {
              ...baseParameter,
              payment_type: "akulaku",
            };
            break;
          case "kredivo":
            paymentParameter = {
              ...baseParameter,
              payment_type: "kredivo",
            };
            break;
          default:
            throw new Error(
              `Unsupported Midtrans identifier configured: ${paymentMethod.midtransIdentifier}`
            );
        }

        let chargeResponse: CoreApiChargeResponse;
        try {
          chargeResponse = await midtransCoreApi.charge(paymentParameter);
          console.log(
            "Midtrans Charge Response:",
            JSON.stringify(chargeResponse, null, 2)
          );
        } catch (error: any) {
          console.error(
            "Midtrans Charge Error:",
            error?.message || error,
            "Payload:",
            JSON.stringify(paymentParameter, null, 2)
          );

          const midtransErrorMessage =
            error?.ApiResponse?.status_message ||
            error?.message ||
            "Unknown error";
          throw new Error(
            `Failed to create Midtrans transaction: ${midtransErrorMessage}`
          );
        }

        if (!["200", "201"].includes(chargeResponse.status_code)) {
          throw new Error(
            `Midtrans charge failed with status ${chargeResponse.status_code}: ${chargeResponse.status_message}`
          );
        }

        const paymentDetail = await tx.paymentDetail.create({
          data: {
            transactionId: transaction.id,
            midtransTransactionId: chargeResponse.transaction_id,
            midtransOrderId: chargeResponse.order_id,
            midtransPaymentType: chargeResponse.payment_type,
            midtransTransactionStatus: mapToMidtransTransactionStatus(
              chargeResponse.transaction_status
            ),
            midtransFraudStatus: mapToMidtransFraudStatus(
              chargeResponse.fraud_status
            ),
            midtransPaymentCode: chargeResponse.payment_code,
            midtransBillKey: chargeResponse.bill_key,
            midtransBillerCode: chargeResponse.biller_code,
            midtransQrCodeUrl: chargeResponse.actions?.find(
              (a) => a.name === "generate-qr-code"
            )?.url,
            midtransRedirectUrl: chargeResponse.redirect_url,
            virtualAccountNumber:
              chargeResponse.va_numbers?.[0]?.va_number ??
              chargeResponse.permata_va_number,
            webUrl: chargeResponse.redirect_url,
            deeplinkUrl:
              chargeResponse.actions?.find(
                (a) => a.name === "deeplink-redirect"
              )?.url ??
              chargeResponse.actions?.find(
                (a) => a.name === "deeplink-web-redirect"
              )?.url,
          },
        });

        const frontendResponseData = {
          orderId: transaction.order?.[0]?.id ?? midtransOrderId,
          transactionId: transaction.id,
          midtransTransactionId: chargeResponse.transaction_id,
          paymentStatus: transaction.paymentStatus,
          midtransInitialStatus: chargeResponse.transaction_status,
          totalAmount: transactionTotalPrice,
          paymentDetails: {
            paymentType: chargeResponse.payment_type,
            vaNumber:
              chargeResponse.va_numbers?.[0]?.va_number ??
              chargeResponse.permata_va_number,
            paymentCode: chargeResponse.payment_code,
            billKey: chargeResponse.bill_key,
            billerCode: chargeResponse.biller_code,
            qrCodeUrl: chargeResponse.actions?.find(
              (a) => a.name === "generate-qr-code"
            )?.url,
            deeplinkUrl:
              chargeResponse.actions?.find(
                (a) => a.name === "deeplink-redirect"
              )?.url ??
              chargeResponse.actions?.find(
                (a) => a.name === "deeplink-web-redirect"
              )?.url,
            redirectUrl: chargeResponse.redirect_url,
            expiryTime: chargeResponse.expiry_time,
          },
        };

        return frontendResponseData;
      },
      {
        timeout: 20000,
      }
    );

    return createSuccessResponse(
      res,
      result,
      "Order created and payment initiated successfully",
      201
    );
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return createErrorResponse(
      res,
      error?.message || "Failed to create order",
      error?.statusCode ||
        (error.message.startsWith("Midtrans charge failed") ? 400 : 500)
    );
  }
};

// *======================= GET =======================*
export const getOrders: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      orderBy,
      orderDirection,
    } = req.query as unknown as {
      page: string;
      limit: string;
      orderBy?: string;
      orderDirection?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const validFields = ["createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const orders = await prisma.order.findMany({
      include: {
        carModelColor: {
          select: {
            carModel: {
              select: {
                id: true,
                name: true,
                carBrand: { select: { id: true, name: true } },
              },
            },
            color: { select: { id: true, name: true } },
          },
        },
        user: {
          select: { id: true, username: true, email: true, profileImage: true },
        },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalOrders = await prisma.order.count();

    createPaginatedResponse(
      res,
      orders,
      currentPage,
      itemsPerPage,
      totalOrders
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getOrdersByWorkshopId: RequestHandler = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const {
      page = "1",
      limit = "10",
      orderBy,
      orderDirection,
    } = req.query as unknown as {
      page: string;
      limit: string;
      orderBy?: string;
      orderDirection?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const validFields = ["createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const orders = await prisma.order.findMany({
      where: { workshopId },
      include: {
        carModelColor: {
          select: {
            carModel: {
              select: {
                id: true,
                name: true,
                carBrand: { select: { id: true, name: true } },
              },
            },
            color: { select: { id: true, name: true } },
          },
        },
        user: {
          select: { id: true, username: true, email: true, profileImage: true },
        },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalOrders = await prisma.order.count({ where: { workshopId } });

    createPaginatedResponse(
      res,
      orders,
      currentPage,
      itemsPerPage,
      totalOrders
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        carModelColor: {
          select: {
            carModel: {
              select: {
                id: true,
                name: true,
                carBrand: { select: { id: true, name: true } },
              },
            },
            color: { select: { id: true, name: true } },
          },
        },
        user: {
          select: { id: true, username: true, email: true, profileImage: true },
        },
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order not found", 404);
    }

    return createSuccessResponse(res, order);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchOrders: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      name,
    } = req.query as unknown as {
      page: string;
      limit: string;
      name: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const orders = await prisma.order.findMany({
      // * where: { name: {mode: "insensitive", contains: name } },
      skip: offset,
      take: +limit,
    });
    const totalOrders = await prisma.order.count({
      // * where: { name: {mode: "insensitive", contains: name } },
    });

    createPaginatedResponse(
      res,
      orders,
      currentPage,
      itemsPerPage,
      totalOrders
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payload: Order = req.body;

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order Not Found", 500);
    }

    const updatedOrder = await prisma.order.update({
      data: payload,
      where: { id: orderId },
    });

    if (order.orderStatus !== updatedOrder.orderStatus) {
      createOrderStatusNotification(updatedOrder);
    }

    if (order.workStatus !== updatedOrder.workStatus) {
      createWorkStatusNotification(updatedOrder);
    }

    return createSuccessResponse(res, updatedOrder, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order Not Found", 500);
    }

    const deletedOrder = await prisma.order.delete({
      where: { id: orderId },
    });

    return createSuccessResponse(res, deletedOrder, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllOrder: RequestHandler = async (req, res) => {
  try {
    const deletedAllOrders = await prisma.order.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllOrders,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// * Current user operations
export const getCurrentUserOrders: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const {
      page = "1",
      limit = "10",
      orderBy,
      orderDirection,
      orderStatus,
      workStatus,
    } = req.query as unknown as {
      page: string;
      limit: string;
      orderStatus: OrderStatus;
      workStatus: WorkStatus;
      orderBy: string;
      orderDirection: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const validFields = ["createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const orders = await prisma.order.findMany({
      where: {
        userId: id,
        AND: [
          { ...(orderStatus && { orderStatus }) },
          { ...(workStatus && { workStatus }) },
        ],
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalOrders = await prisma.order.count({ where: { userId: id } });

    createPaginatedResponse(
      res,
      orders,
      currentPage,
      itemsPerPage,
      totalOrders
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
