import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
import { CarModelYear } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyCarModelYears: RequestHandler = async (req, res) => {
  try {
    const payloads: CarModelYear[] = req.body;

    const carModelYearsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdCarModelYears = await prisma.carModelYear.createMany({
      data: carModelYearsToCreate,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    return createSuccessResponse(
      res,
      createdCarModelYears,
      "Car models Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple carModelYears:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createCarModelYear: RequestHandler = async (req, res) => {
  try {
    const payload: CarModelYear = req.body;

    const createdCarModelYear = await prisma.carModelYear.create({
      data: payload,
    });

    return createSuccessResponse(res, createdCarModelYear, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getCarModelYears: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const carModelYears = await prisma.carModelYear.findMany({
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalCarModelYears = await prisma.carModelYear.count();

    createPaginatedResponse(
      res,
      carModelYears,
      currentPage,
      itemsPerPage,
      totalCarModelYears
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarModelYearsByCarModelId: RequestHandler = async (
  req,
  res
) => {
  try {
    const { carModelId } = req.params;
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const carModelYears = await prisma.carModelYear.findMany({
      where: { carModelId },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalCarModelYears = await prisma.carModelYear.count({
      where: { carModelId },
    });

    createPaginatedResponse(
      res,
      carModelYears,
      currentPage,
      itemsPerPage,
      totalCarModelYears
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarModelYearById: RequestHandler = async (req, res) => {
  try {
    const { carModelYearId } = req.params;
    const carModelYear = await prisma.carModelYear.findUnique({
      where: { id: carModelYearId },
    });

    if (!carModelYear) {
      return createErrorResponse(res, "Car model not found", 404);
    }

    return createSuccessResponse(res, carModelYear);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchCarModelYears: RequestHandler = async (req, res) => {
  try {
    const {
      page = "1",
      limit = "10",
      year,
    } = req.query as unknown as {
      page: string;
      limit: string;
      year: number;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const carModelYears = await prisma.carModelYear.findMany({
      where: { year: { equals: year } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalCarModelYears = await prisma.carModelYear.count({
      where: { year: { equals: year } },
    });

    createPaginatedResponse(
      res,
      carModelYears,
      currentPage,
      itemsPerPage,
      totalCarModelYears
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateCarModelYear: RequestHandler = async (req, res) => {
  try {
    const { carModelYearId } = req.params;
    const payload: CarModelYear = req.body;

    const carModelYear = await prisma.carModelYear.findUnique({
      where: {
        id: carModelYearId,
      },
    });

    if (!carModelYear) {
      return createErrorResponse(res, "Car model Not Found", 500);
    }

    const updatedCarModelYear = await prisma.carModelYear.update({
      data: payload,
      where: { id: carModelYearId },
    });

    return createSuccessResponse(res, updatedCarModelYear, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteCarModelYear: RequestHandler = async (req, res) => {
  try {
    const { carModelYearId } = req.params;

    const carModelYear = await prisma.carModelYear.findUnique({
      where: {
        id: carModelYearId,
      },
    });

    if (!carModelYear) {
      return createErrorResponse(res, "Car model Not Found", 500);
    }

    const deletedCarModelYear = await prisma.carModelYear.delete({
      where: { id: carModelYearId },
    });

    return createSuccessResponse(res, deletedCarModelYear, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllCarModelYear: RequestHandler = async (req, res) => {
  try {
    const deletedAllCarModelYears = await prisma.carModelYear.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllCarModelYears,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
