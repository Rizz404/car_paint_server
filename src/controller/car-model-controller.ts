import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
import { CarModel } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyCarModels: RequestHandler = async (req, res) => {
  try {
    const payloads: CarModel[] = req.body;

    const createdCarModels = await prisma.carModel.createMany({
      data: payloads,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    createSuccessResponse(res, createdCarModels, "Car models Created", 201);
  } catch (error) {
    logger.error("Error creating multiple carModels:", error);
    createErrorResponse(res, error, 500);
  }
};

export const createCarModel: RequestHandler = async (req, res) => {
  try {
    const payload: CarModel = req.body;

    const createdCarModel = await prisma.carModel.create({
      data: payload,
    });

    createSuccessResponse(res, createdCarModel, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getCarModels: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const carModels = await prisma.carModel.findMany({
      skip: offset,
      take: +limit,
      orderBy: { name: "asc" },
    });
    const totalCarModels = await prisma.carModel.count();

    createPaginatedResponse(
      res,
      carModels,
      currentPage,
      itemsPerPage,
      totalCarModels
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const getCarModelById: RequestHandler = async (req, res) => {
  try {
    const { carModelId } = req.params;
    const carModel = await prisma.carModel.findUnique({
      where: { id: carModelId },
    });

    if (!carModel) {
      return createErrorResponse(res, "Car model not found", 404);
    }

    createSuccessResponse(res, carModel);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const searchCarModels: RequestHandler = async (req, res) => {
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

    const carModels = await prisma.carModel.findMany({
      where: { name: { contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalCarModels = await prisma.carModel.count({
      where: { name: { contains: name } },
    });

    createPaginatedResponse(
      res,
      carModels,
      currentPage,
      itemsPerPage,
      totalCarModels
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateCarModel: RequestHandler = async (req, res) => {
  try {
    const { carModelId } = req.params;
    const payload: CarModel = req.body;

    const carModel = await prisma.carModel.findUnique({
      where: {
        id: carModelId,
      },
    });

    if (!carModel) {
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const updatedCarModel = await prisma.carModel.update({
      data: payload,
      where: { id: carModelId },
    });

    createSuccessResponse(res, updatedCarModel, "Updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteCarModel: RequestHandler = async (req, res) => {
  try {
    const { carModelId } = req.params;

    const carModel = await prisma.carModel.findUnique({
      where: {
        id: carModelId,
      },
    });

    if (!carModel) {
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const deletedCarModel = await prisma.carModel.delete({
      where: { id: carModelId },
    });

    createSuccessResponse(res, deletedCarModel, "Deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteAllCarModel: RequestHandler = async (req, res) => {
  try {
    const deletedAllCarModels = await prisma.carModel.deleteMany();

    createSuccessResponse(res, deletedAllCarModels, "All car models deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
