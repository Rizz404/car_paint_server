import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { CarModelColor } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyCarModelColors: RequestHandler = async (req, res) => {
  try {
    const payloads: CarModelColor[] = req.body;

    const carModelColorsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdCarModelColors = await prisma.carModelColor.createMany({
      data: carModelColorsToCreate,
      skipDuplicates: true,
    });

    return createSuccessResponse(
      res,
      createdCarModelColors,
      "Car model year colors Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple carModelColors:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createCarModelColor: RequestHandler = async (req, res) => {
  try {
    const payload: CarModelColor = req.body;

    const existingCarModelColor = await prisma.carModelColor.findFirst({
      where: {
        AND: [{ carModelId: payload.carModelId }, { colorId: payload.colorId }],
      },
    });

    if (existingCarModelColor) {
      return createErrorResponse(
        res,
        "Car Model Year Color already exist",
        400
      );
    }

    const createdCarModelColor = await prisma.carModelColor.create({
      data: payload,
    });

    return createSuccessResponse(res, createdCarModelColor, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getCarModelColors: RequestHandler = async (req, res) => {
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

    const carModelColors = await prisma.carModelColor.findMany({
      include: {
        carModel: {
          select: {
            id: true,
            name: true,
            carBrand: { select: { id: true, name: true } },
          },
        },
        color: { select: { id: true, name: true } },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalCarModelColors = await prisma.carModelColor.count();

    createPaginatedResponse(
      res,
      carModelColors,
      currentPage,
      itemsPerPage,
      totalCarModelColors
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarModelColorsByCarModelId: RequestHandler = async (
  req,
  res
) => {
  try {
    const { carModelId } = req.params;
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

    const carModelColors = await prisma.carModelColor.findMany({
      where: { carModelId }, // Filter berdasarkan carModelId
      include: {
        carModel: {
          select: {
            id: true,
            name: true,
            carBrand: { select: { id: true, name: true } },
          },
        },
        color: { select: { id: true, name: true } },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalCarModelColors = await prisma.carModelColor.count({
      where: { carModelId }, // Count juga difilter
    });

    createPaginatedResponse(
      res,
      carModelColors,
      currentPage,
      itemsPerPage,
      totalCarModelColors
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarModelColorsByColorId: RequestHandler = async (req, res) => {
  try {
    const { colorId } = req.params;
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

    const carModelColors = await prisma.carModelColor.findMany({
      where: { colorId }, // Filter berdasarkan colorId
      include: {
        carModel: {
          select: {
            id: true,
            name: true,
            carBrand: { select: { id: true, name: true } },
          },
        },
        color: { select: { id: true, name: true } },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalCarModelColors = await prisma.carModelColor.count({
      where: { colorId }, // Count juga difilter
    });

    createPaginatedResponse(
      res,
      carModelColors,
      currentPage,
      itemsPerPage,
      totalCarModelColors
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarModelColorsByCarModelColorIdAndColorId: RequestHandler =
  async (req, res) => {
    try {
      const { carModelId, colorId } = req.params;
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

      const { currentPage, itemsPerPage, offset } = parsePagination(
        page,
        limit
      );
      const validFields = ["createdAt", "updatedAt"];
      const { field, direction } = parseOrderBy(
        orderBy,
        orderDirection,
        validFields
      );

      const carModelColors = await prisma.carModelColor.findMany({
        where: {
          carModelId,
          colorId,
        },
        include: {
          carModel: {
            select: {
              id: true,
              name: true,
              carBrand: { select: { id: true, name: true } },
            },
          },
          color: { select: { id: true, name: true } },
        },
        skip: offset,
        take: +limit,
        orderBy: { [field]: direction },
      });
      const totalCarModelColors = await prisma.carModelColor.count({
        where: {
          carModelId,
          colorId,
        }, // Count juga difilter
      });

      createPaginatedResponse(
        res,
        carModelColors,
        currentPage,
        itemsPerPage,
        totalCarModelColors
      );
    } catch (error) {
      return createErrorResponse(res, error, 500);
    }
  };

export const getCarModelColorById: RequestHandler = async (req, res) => {
  try {
    const { carModelId } = req.params;
    const carModelColor = await prisma.carModelColor.findUnique({
      where: { id: carModelId },
      include: {
        carModel: {
          select: {
            id: true,
            name: true,
            carBrand: { select: { id: true, name: true } },
          },
        },
        color: { select: { id: true, name: true } },
      },
    });

    if (!carModelColor) {
      return createErrorResponse(res, "Car model year color not found", 404);
    }

    return createSuccessResponse(res, carModelColor);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateCarModelColor: RequestHandler = async (req, res) => {
  try {
    const { carModelId } = req.params;
    const payload: CarModelColor = req.body;

    const carModelColor = await prisma.carModelColor.findUnique({
      where: {
        id: carModelId,
      },
    });

    if (!carModelColor) {
      return createErrorResponse(res, "Car model year color Not Found", 500);
    }

    const updatedCarModelColor = await prisma.carModelColor.update({
      data: payload,
      where: { id: carModelId },
    });

    return createSuccessResponse(res, updatedCarModelColor, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteCarModelColor: RequestHandler = async (req, res) => {
  try {
    const { carModelId } = req.params;

    const carModelColor = await prisma.carModelColor.findUnique({
      where: {
        id: carModelId,
      },
    });

    if (!carModelColor) {
      return createErrorResponse(res, "Car model year color Not Found", 500);
    }

    const deletedCarModelColor = await prisma.carModelColor.delete({
      where: { id: carModelId },
    });

    return createSuccessResponse(res, deletedCarModelColor, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllCarModelColor: RequestHandler = async (req, res) => {
  try {
    const deletedAllCarModelColors = await prisma.carModelColor.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllCarModelColors,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
