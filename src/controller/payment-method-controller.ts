import prisma from "@/configs/database";
import { xenditPaymentMethodClient } from "@/configs/xendit";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import { deleteCloudinaryImage, isCloudinaryUrl } from "@/utils/cloudinary";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "@/validation/payment-method-validation";
import { PaymentMethod } from "@prisma/client";
import { RequestHandler } from "express";
import { z } from "zod";

type CreatePaymentMethodPayload = z.infer<
  typeof createPaymentMethodSchema.shape.body
>;
type UpdatePaymentMethodPayload = z.infer<
  typeof updatePaymentMethodSchema.shape.body
>;

// *======================= POST =======================*
export const createManyPaymentMethods: RequestHandler = async (req, res) => {
  try {
    const payloads: CreatePaymentMethodPayload[] = req.body;

    const createdPaymentMethods = await prisma.paymentMethod.createMany({
      data: payloads,
      skipDuplicates: true,
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

export const createPaymentMethod: RequestHandler = async (req, res) => {
  try {
    const payload: CreatePaymentMethodPayload = req.body;
    const logo = req.file as Express.Multer.File;

    if (logo && !logo.cloudinary?.secure_url) {
      return createErrorResponse(res, "Cloudinary error", 400);
    }

    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        name: payload.name,
      },
    });

    if (existingPaymentMethod) {
      return createErrorResponse(res, "Payment Method already exists", 400);
    }

    const createdPaymentMethod = await prisma.paymentMethod.create({
      data: { ...payload, logoUrl: logo.cloudinary?.secure_url },
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
    const logo = req.file as Express.Multer.File;

    if (logo && !logo.cloudinary?.secure_url) {
      return createErrorResponse(res, "Cloudinary error", 400);
    }

    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!existingPaymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
    }

    if (logo && logo.cloudinary && logo.cloudinary.secure_url) {
      const imageToDelete = existingPaymentMethod.logoUrl;

      if (imageToDelete && isCloudinaryUrl(imageToDelete)) {
        await deleteCloudinaryImage(imageToDelete);
      }
    }

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

    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: {
        ...payload,
        ...(logo && logo.cloudinary && { logoUrl: logo.cloudinary.secure_url }),
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

    const imageToDelete = paymentMethod.logoUrl;

    if (imageToDelete && isCloudinaryUrl(imageToDelete)) {
      await deleteCloudinaryImage(imageToDelete);
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
      "All payment methods deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
