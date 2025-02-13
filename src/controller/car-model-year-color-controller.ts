import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { CarModelYearColor } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyCarModelYearColors: RequestHandler = async (
  req,
  res
) => {
  try {
    const payloads: CarModelYearColor[] = req.body;

    const carModelYearColorsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdCarModelYearColors = await prisma.carModelYearColor.createMany(
      {
        data: carModelYearColorsToCreate,
        skipDuplicates: true,
      }
    );

    return createSuccessResponse(
      res,
      createdCarModelYearColors,
      "Car model year colors Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple carModelYearColors:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createCarModelYearColor: RequestHandler = async (req, res) => {
  try {
    const payload: CarModelYearColor = req.body;

    const existingCarModelYearColor = await prisma.carModelYearColor.findFirst({
      where: {
        AND: [
          { carModelYearId: payload.carModelYearId },
          { colorId: payload.colorId },
        ],
      },
    });

    if (existingCarModelYearColor) {
      return createErrorResponse(
        res,
        "Car Model Year Color already exist",
        400
      );
    }

    const createdCarModelYearColor = await prisma.carModelYearColor.create({
      data: payload,
    });

    return createSuccessResponse(res, createdCarModelYearColor, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getCarModelYearColors: RequestHandler = async (req, res) => {
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

    const carModelYearColors = await prisma.carModelYearColor.findMany({
      include: {
        carModelYear: { select: { year: true } },
        color: { select: { name: true } },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalCarModelYearColors = await prisma.carModelYearColor.count();

    createPaginatedResponse(
      res,
      carModelYearColors,
      currentPage,
      itemsPerPage,
      totalCarModelYearColors
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarModelYearColorsByCarModelYearId: RequestHandler = async (
  req,
  res
) => {
  try {
    const { carModelYearId } = req.params;
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

    const carModelYearColors = await prisma.carModelYearColor.findMany({
      where: { carModelYearId }, // Filter berdasarkan carModelYearId
      include: {
        carModelYear: { select: { year: true } },
        color: { select: { name: true } },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalCarModelYearColors = await prisma.carModelYearColor.count({
      where: { carModelYearId }, // Count juga difilter
    });

    createPaginatedResponse(
      res,
      carModelYearColors,
      currentPage,
      itemsPerPage,
      totalCarModelYearColors
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarModelYearColorsByColorId: RequestHandler = async (
  req,
  res
) => {
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

    const carModelYearColors = await prisma.carModelYearColor.findMany({
      where: { colorId }, // Filter berdasarkan colorId
      include: {
        carModelYear: { select: { year: true } },
        color: { select: { name: true } },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalCarModelYearColors = await prisma.carModelYearColor.count({
      where: { colorId }, // Count juga difilter
    });

    createPaginatedResponse(
      res,
      carModelYearColors,
      currentPage,
      itemsPerPage,
      totalCarModelYearColors
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarModelYearColorsByCarModelYearIdAndColorId: RequestHandler =
  async (req, res) => {
    try {
      const { carModelYearId, colorId } = req.params;
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

      const carModelYearColors = await prisma.carModelYearColor.findMany({
        where: {
          carModelYearId,
          colorId,
        }, // Filter berdasarkan keduanya
        include: {
          carModelYear: { select: { year: true } },
          color: { select: { name: true } },
        },
        skip: offset,
        take: +limit,
        orderBy: { [field]: direction },
      });
      const totalCarModelYearColors = await prisma.carModelYearColor.count({
        where: {
          carModelYearId,
          colorId,
        }, // Count juga difilter
      });

      createPaginatedResponse(
        res,
        carModelYearColors,
        currentPage,
        itemsPerPage,
        totalCarModelYearColors
      );
    } catch (error) {
      return createErrorResponse(res, error, 500);
    }
  };

export const getCarModelYearColorById: RequestHandler = async (req, res) => {
  try {
    const { carModelYearColorId } = req.params;
    const carModelYearColor = await prisma.carModelYearColor.findUnique({
      where: { id: carModelYearColorId },
      include: {
        carModelYear: { select: { year: true } },
        color: { select: { name: true } },
      },
    });

    if (!carModelYearColor) {
      return createErrorResponse(res, "Car model year color not found", 404);
    }

    return createSuccessResponse(res, carModelYearColor);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateCarModelYearColor: RequestHandler = async (req, res) => {
  try {
    const { carModelYearColorId } = req.params;
    const payload: CarModelYearColor = req.body;

    const carModelYearColor = await prisma.carModelYearColor.findUnique({
      where: {
        id: carModelYearColorId,
      },
    });

    if (!carModelYearColor) {
      return createErrorResponse(res, "Car model year color Not Found", 500);
    }

    const updatedCarModelYearColor = await prisma.carModelYearColor.update({
      data: payload,
      where: { id: carModelYearColorId },
    });

    return createSuccessResponse(res, updatedCarModelYearColor, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteCarModelYearColor: RequestHandler = async (req, res) => {
  try {
    const { carModelYearColorId } = req.params;

    const carModelYearColor = await prisma.carModelYearColor.findUnique({
      where: {
        id: carModelYearColorId,
      },
    });

    if (!carModelYearColor) {
      return createErrorResponse(res, "Car model year color Not Found", 500);
    }

    const deletedCarModelYearColor = await prisma.carModelYearColor.delete({
      where: { id: carModelYearColorId },
    });

    return createSuccessResponse(res, deletedCarModelYearColor, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllCarModelYearColor: RequestHandler = async (req, res) => {
  try {
    const deletedAllCarModelYearColors =
      await prisma.carModelYearColor.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllCarModelYearColors,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
