import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
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
      "Car models Created",
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
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const carServices = await prisma.carService.findMany({
      skip: offset,
      take: +limit,
      orderBy: { name: "asc" },
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
      return createErrorResponse(res, "Car model not found", 404);
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
      where: { name: { contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalCarServices = await prisma.carService.count({
      where: { name: { contains: name } },
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
      return createErrorResponse(res, "Car model Not Found", 500);
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
      return createErrorResponse(res, "Car model Not Found", 500);
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
