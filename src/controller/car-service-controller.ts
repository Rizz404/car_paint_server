import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { CarService } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyCarServices: RequestHandler = async (req, res) => {
  try {
    const payloads: CarService[] = req.body;

    const carServicesToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdCarServices = await prisma.carService.createMany({
      data: carServicesToCreate,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    return createSuccessResponse(
      res,
      createdCarServices,
      "Car services Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple carServices:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createCarService: RequestHandler = async (req, res) => {
  try {
    const payload: CarService = req.body;

    const existingCarService = await prisma.carService.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (existingCarService) {
      return createErrorResponse(res, "Car service already exist", 400);
    }

    const createdCarService = await prisma.carService.create({
      data: payload,
    });

    return createSuccessResponse(res, createdCarService, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getCarServices: RequestHandler = async (req, res) => {
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
    const validFields = ["name", "price", "createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const carServices = await prisma.carService.findMany({
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalCarServices = await prisma.carService.count();

    createPaginatedResponse(
      res,
      carServices,
      currentPage,
      itemsPerPage,
      totalCarServices
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarServiceById: RequestHandler = async (req, res) => {
  try {
    const { carServiceId } = req.params;
    const carService = await prisma.carService.findUnique({
      where: { id: carServiceId },
    });

    if (!carService) {
      return createErrorResponse(res, "Car service not found", 404);
    }

    return createSuccessResponse(res, carService);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchCarServices: RequestHandler = async (req, res) => {
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

    const carServices = await prisma.carService.findMany({
      where: { name: { mode: "insensitive", contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalCarServices = await prisma.carService.count({
      where: { name: { mode: "insensitive", contains: name } },
    });

    createPaginatedResponse(
      res,
      carServices,
      currentPage,
      itemsPerPage,
      totalCarServices
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateCarService: RequestHandler = async (req, res) => {
  try {
    const { carServiceId } = req.params;
    const payload: CarService = req.body;

    const carService = await prisma.carService.findUnique({
      where: {
        id: carServiceId,
      },
    });

    if (!carService) {
      return createErrorResponse(res, "Car service Not Found", 500);
    }

    const updatedCarService = await prisma.carService.update({
      data: payload,
      where: { id: carServiceId },
    });

    return createSuccessResponse(res, updatedCarService, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteCarService: RequestHandler = async (req, res) => {
  try {
    const { carServiceId } = req.params;

    const carService = await prisma.carService.findUnique({
      where: {
        id: carServiceId,
      },
    });

    if (!carService) {
      return createErrorResponse(res, "Car service Not Found", 500);
    }

    const deletedCarService = await prisma.carService.delete({
      where: { id: carServiceId },
    });

    return createSuccessResponse(res, deletedCarService, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllCarService: RequestHandler = async (req, res) => {
  try {
    const deletedAllCarServices = await prisma.carService.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllCarServices,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
