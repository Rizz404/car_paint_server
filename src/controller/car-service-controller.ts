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

    createSuccessResponse(res, createdCarServices, "Car models Created", 201);
  } catch (error) {
    logger.error("Error creating multiple carServices:", error);
    createErrorResponse(res, error, 500);
  }
};

export const createCarService: RequestHandler = async (req, res) => {
  try {
    const payload: CarService = req.body;

    const createdCarService = await prisma.carService.create({
      data: payload,
    });

    createSuccessResponse(res, createdCarService, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
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
    createErrorResponse(res, error, 500);
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

    createSuccessResponse(res, carService);
  } catch (error) {
    createErrorResponse(res, error, 500);
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
    createErrorResponse(res, error, 500);
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
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const updatedCarService = await prisma.carService.update({
      data: payload,
      where: { id: carServiceId },
    });

    createSuccessResponse(res, updatedCarService, "Updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
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
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const deletedCarService = await prisma.carService.delete({
      where: { id: carServiceId },
    });

    createSuccessResponse(res, deletedCarService, "Deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteAllCarService: RequestHandler = async (req, res) => {
  try {
    const deletedAllCarServices = await prisma.carService.deleteMany();

    createSuccessResponse(res, deletedAllCarServices, "All car models deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
