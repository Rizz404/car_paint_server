import prisma from "@/configs/database";
import { xenditInvoiceClient, xenditRefundClient } from "@/configs/xendit";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { createOrderSchema } from "@/validation/order-validation";
import { Order, OrderStatus, Prisma, WorkStatus } from "@prisma/client";
import { RequestHandler } from "express";
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
      select: { fee: true, name: true },
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
          paymentStatus: "PENDING",
          paymentInvoiceUrl: "",
          order: {
            create: {
              userId: user.id,
              userCarId,
              workshopId,
              workStatus: "INSPECTION",
              orderStatus: "DRAFT",
              note: note ?? "",
              totalPrice: orderTotalPrice,
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
              "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app/api/v1/colors",
            failureRedirectUrl:
              "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app/api/v1/colors",
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
              select: {
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
      } catch (error) {
        logger.error("Error creating Xendit invoice:", error);
        throw new Error("Failed to create invoice with Xendit.");
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
      // where: { name: { contains: name } },
      skip: offset,
      take: +limit,
    });
    const totalOrders = await prisma.order.count({
      // where: { name: { contains: name } },
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
    const { id: userId } = req.user!;

    // Cari order beserta transaksinya
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: userId, // Memastikan order milik user yang sedang login
      },
      include: {
        transaction: true,
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order not found", 404);
    }

    // Cek apakah order sudah dalam status yang tidak bisa dibatalkan
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

    // Mulai proses pembatalan dengan transaction untuk konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // Update status order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "CANCELLED",
          workStatus: "CANCELLED",
        },
      });

      // Jika ada transaksi terkait
      if (order.transaction) {
        if (order.transaction.paymentStatus === "PENDING") {
          // Jika pembayaran masih pending, cukup update status
          await tx.transaction.update({
            where: { id: order.transaction.id },
            data: {
              paymentStatus: "FAILED",
            },
          });
        } else if (order.transaction.paymentStatus === "SUCCESS") {
          try {
            // Lakukan refund melalui Xendit
            await xenditRefundClient.createRefund({
              data: {
                invoiceId: order.transaction.invoiceId ?? undefined,
                amount: Number(order.transaction.totalPrice),
                reason: "REQUESTED_BY_CUSTOMER",
                currency: "IDR",
              },
            });

            // Update status transaksi
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
