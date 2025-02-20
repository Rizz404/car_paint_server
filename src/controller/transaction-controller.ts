import prisma from "@/configs/database";
import env from "@/configs/environment";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import {
  XenditPaymentStatus,
  XenditWebhookPayload,
} from "@/types/xendit-webhook";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import {
  PaymentStatus,
  Prisma,
  PrismaClient,
  Transaction,
} from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyTransactions: RequestHandler = async (req, res) => {
  try {
    const payloads: Transaction[] = req.body;

    const transactionsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdTransactions = await prisma.transaction.createMany({
      data: transactionsToCreate,
      skipDuplicates: true,
    });

    return createSuccessResponse(
      res,
      createdTransactions,
      "Transactions Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple transactions:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createTransaction: RequestHandler = async (req, res) => {
  try {
    const payload: Transaction = req.body;

    const createdTransaction = await prisma.transaction.create({
      data: payload,
    });

    return createSuccessResponse(res, createdTransaction, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const confirmTransaction: RequestHandler = async (req, res) => {
  try {
    const callbackToken = req.headers["x-callback-token"];
    const { external_id: transactionId, status }: XenditWebhookPayload =
      req.body;

    if (!callbackToken || callbackToken !== env.XENDIT_CALLBACK_TOKEN) {
      return createErrorResponse(res, "Unauthorized webhook request", 401);
    }

    if (transactionId === "invoice_123124123") {
      return createSuccessResponse(res, {}, "Testing webhook success", 200);
    }

    const handleWebhookStatus = async (
      tx: Omit<
        PrismaClient,
        | "$connect"
        | "$disconnect"
        | "$on"
        | "$transaction"
        | "$use"
        | "$extends"
      >
    ) => {
      const transaction = await tx.transaction.findFirst({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new Error(`No transaction found: ${transactionId}`);
      }

      switch (status) {
        case "PAID":
          const updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "SUCCESS",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "DRAFT" },
                },
              },
            },
            include: {
              order: {
                select: {
                  id: true,
                  userId: true,
                },
              },
            },
          });

          const latestTicket = await tx.eTicket.findFirst({
            orderBy: {
              ticketNumber: "desc",
            },
          });

          const newTicketNumber = (latestTicket?.ticketNumber ?? 0) + 1;
          const ticket = await tx.eTicket.create({
            data: {
              userId: updatedTransaction.userId,
              orderId: updatedTransaction.order[0].id,
              ticketNumber: newTicketNumber,
            },
          });

          return {
            transaction: updatedTransaction,
            ticket,
          };

        case "EXPIRED":
          return await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "EXPIRED",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "CANCELLED" },
                },
              },
            },
          });

        case "STOPPED":
          return await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "FAILED",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "CANCELLED" },
                },
              },
            },
          });

        default:
          return {};
      }
    };

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await prisma.$transaction(
          async (tx) => handleWebhookStatus(tx),
          {
            timeout: 5000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          }
        );
        return createSuccessResponse(
          res,
          response,
          "Webhook processed successfully",
          200
        );
      } catch (error) {
        lastError = error;
        logger.error(`Transaction attempt ${attempt} failed:`, error);
        if (attempt === 3) break;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    logger.error("All transaction attempts failed:", lastError);
    return createErrorResponse(
      res,
      "Error processing webhook after retries",
      500
    );
  } catch (error) {
    logger.error("Webhook processing error:", error);
    return createErrorResponse(res, "Error processing webhook", 500);
  }
};

// *======================= GET =======================*
export const getTransactions: RequestHandler = async (req, res) => {
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
    const validFields = ["name", "createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const transactions = await prisma.transaction.findMany({
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalTransactions = await prisma.transaction.count();

    createPaginatedResponse(
      res,
      transactions,
      currentPage,
      itemsPerPage,
      totalTransactions
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getTransactionById: RequestHandler = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return createErrorResponse(res, "Transaction not found", 404);
    }

    return createSuccessResponse(res, transaction);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchTransactions: RequestHandler = async (req, res) => {
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

    const transactions = await prisma.transaction.findMany({
      // where: { name: {mode: "insensitive", contains: name } },
      skip: offset,
      take: +limit,
    });
    const totalTransactions = await prisma.transaction.count({
      // where: { name: {mode: "insensitive", contains: name } },
    });

    createPaginatedResponse(
      res,
      transactions,
      currentPage,
      itemsPerPage,
      totalTransactions
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateTransaction: RequestHandler = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const payload: Transaction = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return createErrorResponse(res, "Transaction Not Found", 500);
    }

    const updatedTransaction = await prisma.transaction.update({
      data: payload,
      where: { id: transactionId },
    });

    return createSuccessResponse(res, updatedTransaction, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteTransaction: RequestHandler = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      return createErrorResponse(res, "Transaction Not Found", 500);
    }

    const deletedTransaction = await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return createSuccessResponse(res, deletedTransaction, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllTransaction: RequestHandler = async (req, res) => {
  try {
    const deletedAllTransactions = await prisma.transaction.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllTransactions,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// * Current user operations
export const getCurrentUserTransactions: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const {
      page = "1",
      limit = "10",
      orderBy,
      orderDirection,
      paymentStatus,
      paymentMethod,
    } = req.query as unknown as {
      page: string;
      limit: string;
      paymentStatus: PaymentStatus;
      paymentMethod: string;
      orderBy: string;
      orderDirection: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const validFields = ["name", "createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: id,
        AND: [
          { ...(paymentStatus && { paymentStatus }) },
          { ...(paymentMethod && { paymentMethod: { name: paymentMethod } }) },
        ],
      },
      include: {
        paymentMethod: { select: { id: true, name: true, fee: true } },
        order: true,
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalTransactions = await prisma.transaction.count({
      where: { userId: id },
    });

    createPaginatedResponse(
      res,
      transactions,
      currentPage,
      itemsPerPage,
      totalTransactions
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
