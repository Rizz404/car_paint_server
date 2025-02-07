import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
import { PaymentMethod } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyPaymentMethods: RequestHandler = async (req, res) => {
  try {
    const payloads: PaymentMethod[] = req.body;

    const paymentMethodsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdPaymentMethods = await prisma.paymentMethod.createMany({
      data: paymentMethodsToCreate,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    return createSuccessResponse(
      res,
      createdPaymentMethods,
      "Car brands Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple paymentMethods:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createPaymentMethod: RequestHandler = async (req, res) => {
  try {
    const payload: PaymentMethod = req.body;

    const createdPaymentMethod = await prisma.paymentMethod.create({
      data: payload,
    });

    return createSuccessResponse(res, createdPaymentMethod, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getPaymentMethods: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const paymentMethods = await prisma.paymentMethod.findMany({
      skip: offset,
      take: +limit,
      orderBy: { name: "asc" },
    });
    const totalPaymentMethods = await prisma.paymentMethod.count();

    createPaginatedResponse(
      res,
      paymentMethods,
      currentPage,
      itemsPerPage,
      totalPaymentMethods
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getPaymentMethodById: RequestHandler = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Car brand not found", 404);
    }

    return createSuccessResponse(res, paymentMethod);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchPaymentMethods: RequestHandler = async (req, res) => {
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

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { name: { contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalPaymentMethods = await prisma.paymentMethod.count({
      where: { name: { contains: name } },
    });

    createPaginatedResponse(
      res,
      paymentMethods,
      currentPage,
      itemsPerPage,
      totalPaymentMethods
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updatePaymentMethod: RequestHandler = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const payload: PaymentMethod = req.body;

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Car brand Not Found", 500);
    }

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      data: payload,
      where: { id: paymentMethodId },
    });

    return createSuccessResponse(res, updatedPaymentMethod, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deletePaymentMethod: RequestHandler = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Car brand Not Found", 500);
    }

    const deletedPaymentMethod = await prisma.paymentMethod.delete({
      where: { id: paymentMethodId },
    });

    return createSuccessResponse(res, deletedPaymentMethod, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllPaymentMethod: RequestHandler = async (req, res) => {
  try {
    const deletedAllPaymentMethods = await prisma.paymentMethod.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllPaymentMethods,
      "All car brands deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
