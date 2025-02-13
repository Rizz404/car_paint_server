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

// *======================= GET =======================*
export const getHistories: RequestHandler = async (req, res) => {
  try {
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

    const transactions = await prisma.transaction.findMany({
      where: {
        AND: [
          { ...(paymentStatus && { paymentStatus }) },
          { ...(paymentMethod && { paymentMethod: { name: paymentMethod } }) },
        ],
      },
      include: {
        paymentMethod: { select: { name: true, fee: true } },
        order: {
          select: {
            note: true,
            orderStatus: true,
            totalPrice: true,
            workshop: { select: { name: true, address: true } },
            carServices: { select: { name: true, price: true } },
            eTicket: { select: { ticketNumber: true } },
          },
        },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalTransactions = await prisma.transaction.count({
      where: {
        AND: [
          { ...(paymentStatus && { paymentStatus }) },
          { ...(paymentMethod && { paymentMethod: { name: paymentMethod } }) },
        ],
      },
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

export const getHistoryById: RequestHandler = async (req, res) => {
  try {
    const { historyId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: historyId },
      include: {
        paymentMethod: { select: { name: true, fee: true } },
        order: {
          select: {
            note: true,
            orderStatus: true,
            totalPrice: true,
            workshop: { select: { name: true, address: true } },
            carServices: { select: { name: true, price: true } },
            eTicket: { select: { ticketNumber: true } },
          },
        },
      },
    });

    if (!transaction) {
      return createErrorResponse(res, "History not found", 404);
    }

    return createSuccessResponse(res, transaction);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*

// *======================= DELETE =======================*

// * Current user operations
export const getCurrentUserHistories: RequestHandler = async (req, res) => {
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
    const validFields = ["createdAt", "updatedAt"];
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
        paymentMethod: { select: { name: true, fee: true } },
        order: {
          select: {
            note: true,
            orderStatus: true,
            totalPrice: true,
            workshop: { select: { name: true, address: true } },
            carServices: { select: { name: true, price: true } },
            eTicket: { select: { ticketNumber: true } },
          },
        },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalTransactions = await prisma.transaction.count({
      where: {
        userId: id,
        AND: [
          { ...(paymentStatus && { paymentStatus }) },
          { ...(paymentMethod && { paymentMethod: { name: paymentMethod } }) },
        ],
      },
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
