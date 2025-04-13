import prisma from "@/configs/database";
import env from "@/configs/environment";
import { xenditPaymentMethodClient } from "@/configs/xendit";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { PaymentStatus, Transaction } from "@prisma/client";
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

// Todo: error di get transactions
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
      include: {
        paymentDetail: true,
        paymentMethod: true,
        cancellation: true,
        refund: true,
      },
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
      include: {
        paymentDetail: true,
        paymentMethod: true,
        cancellation: true,
        refund: true,
      },
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
      include: {
        paymentDetail: true,
        paymentMethod: true,
        cancellation: true,
        refund: true,
      },
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

// *======================= Current user operations =======================*
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
        paymentDetail: true,
        paymentMethod: true,
        cancellation: true,
        refund: true,
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

// *======================= Xendit =======================*
// * Ewallet bayarnya pake link ya gak support ini
export const simulatePaymentXendit: RequestHandler = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const { amount } = req.body;

    await xenditPaymentMethodClient.simulatePayment({
      paymentMethodId: referenceId,
      data: { amount },
    });

    return createSuccessResponse(res, {}, "Successfully paid", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
