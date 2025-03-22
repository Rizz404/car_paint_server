import prisma from "@/configs/database";
import { xenditPaymentMethodClient } from "@/configs/xendit";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import {
  EWalletPaymentConfig,
  PaymentMethod,
  VirtualAccountConfig,
} from "@prisma/client";
import { RequestHandler } from "express";

type CreatePaymentMethodPayload = Omit<
  PaymentMethod,
  "id" | "createdAt" | "updatedAt"
> & {
  eWalletPaymentConfig?: Omit<
    EWalletPaymentConfig,
    "id" | "paymentMethodId" | "createdAt" | "updatedAt"
  >;
  virtualAccountConfig?: Omit<
    VirtualAccountConfig,
    "id" | "paymentMethodId" | "createdAt" | "updatedAt"
  >;
};

type UpdatePaymentMethodPayload = Partial<
  Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">
> & {
  eWalletPaymentConfig?: Omit<
    EWalletPaymentConfig,
    "id" | "paymentMethodId" | "createdAt" | "updatedAt"
  >;
  virtualAccountConfig?: Omit<
    VirtualAccountConfig,
    "id" | "paymentMethodId" | "createdAt" | "updatedAt"
  >;
};

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
      "Payment methods Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple paymentMethods:", error);
    return createErrorResponse(res, error, 500);
  }
};

// Todo: Nanti tambahin, sekarang input manual langsung ke database untuk logo payment method
export const createPaymentMethod: RequestHandler = async (req, res) => {
  try {
    const payload: CreatePaymentMethodPayload = req.body;
    const logoUrl = req.file as Express.Multer.File;

    if (payload.type === "EWALLET" && !payload.eWalletPaymentConfig) {
      return createErrorResponse(
        res,
        "E-Wallet payment method requires eWalletPaymentConfig",
        400
      );
    }

    if (payload.type === "VIRTUAL_ACCOUNT" && !payload.virtualAccountConfig) {
      return createErrorResponse(
        res,
        "Virtual Account payment method requires virtualAccountConfig",
        400
      );
    }

    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        name: payload.name,
      },
    });

    if (existingPaymentMethod) {
      return createErrorResponse(res, "Payment Method already exists", 400);
    }

    const { eWalletPaymentConfig, virtualAccountConfig, ...paymentMethodData } =
      payload;

    const createdPaymentMethod = await prisma.paymentMethod.create({
      data: {
        ...paymentMethodData,
        eWalletPaymentConfig: eWalletPaymentConfig
          ? {
              create: eWalletPaymentConfig,
            }
          : undefined,
        virtualAccountConfig: virtualAccountConfig
          ? {
              create: virtualAccountConfig,
            }
          : undefined,
      },
      include: {
        eWalletPaymentConfig: true,
        virtualAccountConfig: true,
      },
    });

    return createSuccessResponse(res, createdPaymentMethod, "Created", 201);
  } catch (error) {
    console.error("Error creating payment method:", error);
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getPaymentMethods: RequestHandler = async (req, res) => {
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

    const paymentMethods = await prisma.paymentMethod.findMany({
      include: { eWalletPaymentConfig: true, virtualAccountConfig: true },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
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

export const getPaymentMethodsFromXendit: RequestHandler = async (req, res) => {
  try {
    const paymentMethodsFromXendit =
      await xenditPaymentMethodClient.getAllPaymentMethods({ limit: 1000 });

    return createSuccessResponse(res, paymentMethodsFromXendit);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getPaymentMethodById: RequestHandler = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: { eWalletPaymentConfig: true, virtualAccountConfig: true },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
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
      where: { name: { mode: "insensitive", contains: name } },
      include: { eWalletPaymentConfig: true, virtualAccountConfig: true },
      skip: offset,
      take: +limit,
    });
    const totalPaymentMethods = await prisma.paymentMethod.count({
      where: { name: { mode: "insensitive", contains: name } },
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
    const payload: UpdatePaymentMethodPayload = req.body;

    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: {
        eWalletPaymentConfig: true,
        virtualAccountConfig: true,
      },
    });

    if (!existingPaymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
    }

    if (payload.type) {
      if (
        payload.type === "EWALLET" &&
        !payload.eWalletPaymentConfig &&
        !existingPaymentMethod.eWalletPaymentConfig
      ) {
        return createErrorResponse(
          res,
          "E-Wallet payment method requires eWalletPaymentConfig",
          400
        );
      }
      if (
        payload.type === "VIRTUAL_ACCOUNT" &&
        !payload.virtualAccountConfig &&
        !existingPaymentMethod.virtualAccountConfig
      ) {
        return createErrorResponse(
          res,
          "Virtual Account payment method requires virtualAccountConfig",
          400
        );
      }
    }

    // Only check name if it's being updated
    if (payload.name && payload.name !== existingPaymentMethod.name) {
      const nameExists = await prisma.paymentMethod.findFirst({
        where: {
          name: payload.name,
          id: { not: paymentMethodId },
        },
      });
      if (nameExists) {
        return createErrorResponse(
          res,
          "Payment Method name already exists",
          400
        );
      }
    }

    const { eWalletPaymentConfig, virtualAccountConfig, ...paymentMethodData } =
      payload;

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: {
        ...paymentMethodData,
        eWalletPaymentConfig: eWalletPaymentConfig
          ? {
              upsert: {
                create: eWalletPaymentConfig,
                update: eWalletPaymentConfig,
              },
            }
          : payload.type === "VIRTUAL_ACCOUNT"
            ? { delete: true }
            : undefined,
        virtualAccountConfig: virtualAccountConfig
          ? {
              upsert: {
                create: virtualAccountConfig,
                update: virtualAccountConfig,
              },
            }
          : payload.type === "EWALLET"
            ? { delete: true }
            : undefined,
      },
      include: {
        eWalletPaymentConfig: true,
        virtualAccountConfig: true,
      },
    });

    return createSuccessResponse(res, updatedPaymentMethod, "Updated");
  } catch (error) {
    console.error("Error updating payment method:", error);
    return createErrorResponse(res, "Failed to update payment method", 500);
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
      return createErrorResponse(res, "Payment method Not Found", 500);
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
