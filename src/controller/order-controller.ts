import prisma from "@/configs/database";
import {
  xenditCustomerClient,
  xenditInvoiceClient,
  xenditPaymentRequestClient,
  xenditRefundClient,
} from "@/configs/xendit";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { createOrderSchema } from "@/validation/order-validation";
import {
  Order,
  OrderStatus,
  PaymentDetail,
  Prisma,
  WorkStatus,
} from "@prisma/client";
import { RequestHandler } from "express";
import { PaymentRequestParameters } from "xendit-node/payment_request/models";
import { EWalletChannelCode } from "xendit-node/payment_request/models/EWalletChannelCode";
import { EWalletParameters } from "xendit-node/payment_request/models/EWalletParameters";
import { VirtualAccountChannelCode } from "xendit-node/payment_request/models/VirtualAccountChannelCode";
import { VirtualAccountParameters } from "xendit-node/payment_request/models/VirtualAccountParameters";
import { z } from "zod";

type CreateOrderDTO = z.infer<typeof createOrderSchema>["body"];

// *======================= POST =======================*
export const createManyOrders: RequestHandler = async (req, res) => {
  try {
    const payloads: Order[] = req.body;

    const ordersToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdOrders = await prisma.order.createMany({
      data: ordersToCreate,
      skipDuplicates: true,
    });

    return createSuccessResponse(res, createdOrders, "Orders Created", 201);
  } catch (error) {
    logger.error("Error creating multiple orders:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const {
      carServices,
      paymentMethodId,
      userCarId,
      workshopId,
      note,
    }: CreateOrderDTO & { paymentMethodId: string } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    const carServicesData = await prisma.carService.findMany({
      where: {
        id: {
          in: carServices.map((service) => service.carServiceId),
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    // * Buat map untuk mempermudah pengecekan harga
    const carServicePriceMap = new Map(
      carServicesData.map((service) => [service.id, service.price])
    );

    // * Validasi car services yang tidak ditemukan
    const missingServices = carServices.filter(
      (service) => !carServicePriceMap.has(service.carServiceId)
    );

    if (missingServices.length > 0) {
      return createErrorResponse(
        res,
        `Car services not found: ${missingServices.map((s) => s.carServiceId).join(", ")}`,
        404
      );
    }

    // * Hitung total harga order tanpa quantity (diasumsikan 1 per service)
    const orderTotalPrice = carServices.reduce((sum, service) => {
      const price = carServicePriceMap.get(service.carServiceId)!;
      return sum.add(price);
    }, new Prisma.Decimal(0));

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      select: { fee: true, name: true, channelCode: true, reusability: true },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
    }

    // * Fee admin saat ini 0
    const adminFee = new Prisma.Decimal(0);
    const paymentMethodFee = new Prisma.Decimal(paymentMethod.fee);

    // * Hitung total harga transaksi
    const transactionTotalPrice = orderTotalPrice
      .add(adminFee)
      .add(paymentMethodFee);

    const result = await prisma.$transaction(async (tx) => {
      let updatedTransaction;
      const createTransaction = await tx.transaction.create({
        data: {
          userId: user.id,
          paymentMethodId,
          adminFee,
          paymentMethodFee,
          totalPrice: transactionTotalPrice,
          order: {
            create: {
              userId: user.id,
              userCarId,
              workshopId,
              note: note ?? "",
              subtotalPrice: orderTotalPrice,
              carServices: {
                connect: carServicesData.map(({ id }) => ({ id })),
              },
            },
          },
        },
      });

      try {
        const createInvoice = await xenditInvoiceClient.createInvoice({
          data: {
            amount: Number(transactionTotalPrice),
            externalId: createTransaction.id,
            payerEmail: user.email,
            currency: "IDR",
            invoiceDuration: "172800", // * 48 jam
            reminderTime: 1,
            paymentMethods: [paymentMethod.name],
            items: carServicesData.map((carserviceData) => ({
              name: carserviceData.name,
              price: Number(carserviceData.price),
              quantity: 1,
              category: "car service",
              referenceId: carserviceData.id,
            })),
            successRedirectUrl:
              "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
            failureRedirectUrl:
              "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
            shouldSendEmail: true,
          },
        });

        updatedTransaction = await tx.transaction.update({
          where: { id: createTransaction.id },
          data: {
            paymentInvoiceUrl: createInvoice.invoiceUrl,
            invoiceId: createInvoice.id,
          },
          include: {
            order: {
              include: {
                carServices: { select: { name: true, price: true } },
                workshop: {
                  select: {
                    name: true,
                    address: true,
                  },
                },
              },
            },
            paymentMethod: { select: { name: true } },
          },
        });
      } catch (error: any) {
        // Force error output to console
        console.error("RAW ERROR OBJECT:", error);
        console.error("ERROR CONSTRUCTOR:", error?.constructor?.name);
        console.error("ERROR PROPERTIES:", Object.keys(error || {}));
        console.error("ERROR PROTOTYPE:", Object.getPrototypeOf(error));

        // For axios-like errors
        if (error?.response) {
          console.error("RESPONSE STATUS:", error.response.status);
          console.error("RESPONSE DATA:", error.response.data);
        }

        // For SDK-specific errors
        if (error?.details) console.error("ERROR DETAILS:", error.details);
        if (error?.message) console.error("ERROR MESSAGE:", error.message);

        throw error; // Re-throw to preserve the original error
      }

      return updatedTransaction;
    });

    return createSuccessResponse(
      res,
      result,
      "Order created successfully",
      201
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const createOrderWithPaymentRequest: RequestHandler = async (
  req,
  res
) => {
  try {
    const { id: userId } = req.user!;
    const {
      carServices,
      paymentMethodId,
      userCarId,
      workshopId,
      note,
    }: CreateOrderDTO & { paymentMethodId: string } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, userProfile: true },
    });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    if (!user.userProfile || !user.userProfile.phoneNumber) {
      return createErrorResponse(res, "Phone number is required", 400);
    }

    const carServicesData = await prisma.carService.findMany({
      where: {
        id: {
          in: carServices.map((service) => service.carServiceId),
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    if (carServicesData.length !== carServices.length) {
      const missingIds = carServices
        .filter(
          (service) =>
            !carServicesData.some((cs) => cs.id === service.carServiceId)
        )
        .map((service) => service.carServiceId);
      return createErrorResponse(
        res,
        `Missing car services: ${missingIds.join(", ")}`,
        404
      );
    }

    const orderTotalPrice = carServicesData.reduce(
      (sum, service) => sum.add(service.price),
      new Prisma.Decimal(0)
    );

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: { eWalletPaymentConfig: true, virtualAccountConfig: true },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
    }

    // Todo: Uncoment kalo udah fix
    // if (
    //   paymentMethod.type !== "EWALLET" &&
    //   paymentMethod.type !== "VIRTUAL_ACCOUNT"
    // ) {
    //   return createErrorResponse(res, "Unsupported payment method type", 400);
    // }

    const adminFee = new Prisma.Decimal(0);
    const paymentMethodFee = new Prisma.Decimal(paymentMethod.fee);
    const transactionTotalPrice = orderTotalPrice
      .add(adminFee)
      .add(paymentMethodFee);

    const result = await prisma.$transaction(async (tx) => {
      let updatedTransaction;

      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          paymentMethodId,
          adminFee,
          paymentMethodFee,
          totalPrice: transactionTotalPrice,
          order: {
            create: {
              userId: user.id,
              userCarId,
              workshopId,
              note: note,
              subtotalPrice: orderTotalPrice,
              carServices: {
                connect: carServicesData.map(({ id }) => ({ id })),
              },
            },
          },
        },
        include: { order: true },
      });

      try {
        const paymentRequestData: PaymentRequestParameters = {
          referenceId: transaction.id,
          amount: Number(transactionTotalPrice),
          currency: "IDR",
          description: note || "Car service payment",
          items: carServicesData.map((service) => ({
            name: service.name,
            price: Number(service.price),
            currency: "IDR",
            quantity: 1,
            category: "CAR_SERVICE",
            referenceId: service.id,
            type: "SERVICE",
          })),
          paymentMethod: {
            type: paymentMethod.type,
            reusability: paymentMethod.reusability,
          },
        };

        if (paymentMethod.type === "EWALLET") {
          if (!paymentMethod.eWalletPaymentConfig) {
            throw new Error("E-Wallet configuration not found");
          }

          if (!paymentRequestData.paymentMethod) {
            throw new Error("Base payment method in payment request not found");
          }

          paymentRequestData.paymentMethod.ewallet = {
            channelCode: paymentMethod.eWalletPaymentConfig
              .channelCode as EWalletChannelCode,
            channelProperties: {
              ...(user.userProfile?.phoneNumber && {
                mobileNumber: user.userProfile.phoneNumber,
              }),
              ...(paymentMethod.eWalletPaymentConfig.successReturnUrl && {
                successReturnUrl:
                  paymentMethod.eWalletPaymentConfig.successReturnUrl,
              }),
              ...(paymentMethod.eWalletPaymentConfig.failureReturnUrl && {
                failureReturnUrl:
                  paymentMethod.eWalletPaymentConfig.failureReturnUrl,
              }),
            },
          };
        } else if (paymentMethod.type === "VIRTUAL_ACCOUNT") {
          if (!paymentMethod.virtualAccountConfig) {
            throw new Error("Virtual Account configuration not found");
          }

          if (!paymentRequestData.paymentMethod) {
            throw new Error("Base payment method in payment request not found");
          }

          paymentRequestData.paymentMethod.virtualAccount = {
            channelCode: paymentMethod.virtualAccountConfig
              .bankCode as VirtualAccountChannelCode,
            channelProperties: {
              customerName: user.username,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          };
        }

        const paymentResponse =
          await xenditPaymentRequestClient.createPaymentRequest({
            data: paymentRequestData,
          });

        const deeplink = paymentResponse.actions?.find(
          (a) => a.urlType === "DEEPLINK"
        )?.url;
        const mobileUrl = paymentResponse.actions?.find(
          (a) => a.urlType === "MOBILE"
        )?.url;
        const webUrl = paymentResponse.actions?.find(
          (a) => a.urlType === "WEB"
        )?.url;

        await tx.paymentDetail.create({
          data: {
            transactionId: transaction.id,
            ...(deeplink && { deeplinkUrl: deeplink }),
            ...(mobileUrl && { mobileUrl }),
            ...(webUrl && { webUrl }),
          },
        });

        return transaction.order;
      } catch (error: any) {
        // Force error output to console
        console.error("RAW ERROR OBJECT:", error);
        console.error("ERROR PROPERTIES:", Object.keys(error || {}));
        console.error("ERROR PROTOTYPE:", Object.getPrototypeOf(error));
        console.error("ERROR DETAILS:", error.response.errors);

        // For axios-like errors
        if (error?.response) {
          console.error("RESPONSE STATUS:", error.response.status);
          console.error("RESPONSE DATA:", error.response.data);
        }

        // For SDK-specific errors
        if (error?.details) console.error("ERROR DETAILS:", error.details);
        if (error?.message) console.error("ERROR MESSAGE:", error.message);

        throw error; // Re-throw to preserve the original error
      }
    });

    return createSuccessResponse(
      res,
      result,
      "Order created successfully",
      201
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
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

    return createSuccessResponse(res, updatedOrder, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const cancelOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    // * Cari order beserta transaksinya
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        transaction: true,
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order not found", 404);
    }

    // * Cek apakah order sudah dalam status yang tidak bisa dibatalkan
    if (
      order.orderStatus === "COMPLETED" ||
      order.orderStatus === "CANCELLED"
    ) {
      return createErrorResponse(
        res,
        `Order cannot be cancelled because it's already ${order.orderStatus}`,
        400
      );
    }

    if (!order.transaction.invoiceId) {
      return createErrorResponse(res, `Invoice id not found`, 404);
    }

    // * Mulai proses pembatalan dengan transaction untuk konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // * Update status order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "CANCELLED",
          workStatus: "CANCELLED",
        },
      });

      // * Jika ada transaksi terkait
      if (order.transaction) {
        if (order.transaction.paymentStatus === "PENDING") {
          // * Jika pembayaran masih pending, cukup update status dan jadiin invoicenya expired
          if (order.transaction.invoiceId) {
            await xenditInvoiceClient.expireInvoice({
              invoiceId: order.transaction.invoiceId,
            });
          }
          await tx.transaction.update({
            where: { id: order.transaction.id },
            data: {
              paymentStatus: "FAILED",
            },
          });
        } else if (order.transaction.paymentStatus === "SUCCESS") {
          try {
            // * Lakukan refund melalui Xendit
            await xenditRefundClient.createRefund({
              data: {
                invoiceId: order.transaction.invoiceId ?? undefined,
                amount: Number(order.transaction.totalPrice),
                reason: "CANCELLATION",
                currency: "IDR",
              },
            });

            // * Update status transaksi
            await tx.transaction.update({
              where: { id: order.transaction.id },
              data: {
                paymentStatus: "REFUNDED",
                refundAmount: order.transaction.totalPrice,
                refundedAt: new Date(),
              },
            });
          } catch (error) {
            logger.error("Error processing refund:", error);
            throw new Error("Gagal memproses refund pembayaran");
          }
        }
      }

      return updatedOrder;
    });

    return createSuccessResponse(res, result, "Order berhasil dibatalkan", 200);
  } catch (error) {
    logger.error("Error cancelling order:", error);
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

export const cancelCurrentUserOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { id: userId } = req.user!;

    // * Cari order beserta transaksinya
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: userId, // * Memastikan order milik user yang sedang login
      },
      include: {
        transaction: true,
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order not found", 404);
    }

    // * Cek apakah order sudah dalam status yang tidak bisa dibatalkan
    if (
      order.orderStatus === "COMPLETED" ||
      order.orderStatus === "CANCELLED"
    ) {
      return createErrorResponse(
        res,
        `Order cannot be cancelled because it's already ${order.orderStatus}`,
        400
      );
    }

    if (!order.transaction.invoiceId) {
      return createErrorResponse(res, `Invoice id not found`, 404);
    }

    // * Mulai proses pembatalan dengan transaction untuk konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // * Update status order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "CANCELLED",
          workStatus: "CANCELLED",
        },
      });

      // * Jika ada transaksi terkait
      if (order.transaction) {
        if (order.transaction.paymentStatus === "PENDING") {
          // * Jika pembayaran masih pending, cukup update status
          await tx.transaction.update({
            where: { id: order.transaction.id },
            data: {
              paymentStatus: "FAILED",
            },
          });
        } else if (order.transaction.paymentStatus === "SUCCESS") {
          try {
            // * Lakukan refund melalui Xendit
            await xenditRefundClient.createRefund({
              data: {
                invoiceId: order.transaction.invoiceId ?? undefined,
                amount: Number(order.transaction.totalPrice),
                reason: "REQUESTED_BY_CUSTOMER",
                currency: "IDR",
              },
            });

            // * Update status transaksi
            await tx.transaction.update({
              where: { id: order.transaction.id },
              data: {
                paymentStatus: "REFUNDED",
                refundAmount: order.transaction.totalPrice,
                refundedAt: new Date(),
              },
            });
          } catch (error) {
            logger.error("Error processing refund:", error);
            throw new Error("Gagal memproses refund pembayaran");
          }
        }
      }

      return updatedOrder;
    });

    return createSuccessResponse(res, result, "Order berhasil dibatalkan", 200);
  } catch (error) {
    logger.error("Error cancelling order:", error);
    return createErrorResponse(res, error, 500);
  }
};
