import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
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
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    createSuccessResponse(
      res,
      createdCarModelColors,
      "Car models Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple carModelColors:", error);
    createErrorResponse(res, error, 500);
  }
};

export const createCarModelColor: RequestHandler = async (req, res) => {
  try {
    const payload: CarModelColor = req.body;

    const createdCarModelColor = await prisma.carModelColor.create({
      data: payload,
    });

    createSuccessResponse(res, createdCarModelColor, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getCarModelColors: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const carModelColors = await prisma.carModelColor.findMany({
      skip: offset,
      take: +limit,
      orderBy: { name: "asc" },
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
    createErrorResponse(res, error, 500);
  }
};

export const getCarModelColorsByCarModelId: RequestHandler = async (
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

    const carModelColors = await prisma.carModelColor.findMany({
      where: { carModelId },
      skip: offset,
      take: +limit,
      orderBy: { name: "asc" },
    });
    const totalCarModelColors = await prisma.carModelColor.count({
      where: { carModelId },
    });

    createPaginatedResponse(
      res,
      carModelColors,
      currentPage,
      itemsPerPage,
      totalCarModelColors
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const getCarModelColorById: RequestHandler = async (req, res) => {
  try {
    const { carModelColorId } = req.params;
    const carModelColor = await prisma.carModelColor.findUnique({
      where: { id: carModelColorId },
    });

    if (!carModelColor) {
      return createErrorResponse(res, "Car model not found", 404);
    }

    createSuccessResponse(res, carModelColor);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const searchCarModelColors: RequestHandler = async (req, res) => {
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

    const carModelColors = await prisma.carModelColor.findMany({
      where: { name: { contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalCarModelColors = await prisma.carModelColor.count({
      where: { name: { contains: name } },
    });

    createPaginatedResponse(
      res,
      carModelColors,
      currentPage,
      itemsPerPage,
      totalCarModelColors
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateCarModelColor: RequestHandler = async (req, res) => {
  try {
    const { carModelColorId } = req.params;
    const payload: CarModelColor = req.body;

    const carModelColor = await prisma.carModelColor.findUnique({
      where: {
        id: carModelColorId,
      },
    });

    if (!carModelColor) {
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const updatedCarModelColor = await prisma.carModelColor.update({
      data: payload,
      where: { id: carModelColorId },
    });

    createSuccessResponse(res, updatedCarModelColor, "Updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteCarModelColor: RequestHandler = async (req, res) => {
  try {
    const { carModelColorId } = req.params;

    const carModelColor = await prisma.carModelColor.findUnique({
      where: {
        id: carModelColorId,
      },
    });

    if (!carModelColor) {
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const deletedCarModelColor = await prisma.carModelColor.delete({
      where: { id: carModelColorId },
    });

    createSuccessResponse(res, deletedCarModelColor, "Deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteAllCarModelColor: RequestHandler = async (req, res) => {
  try {
    const deletedAllCarModelColors = await prisma.carModelColor.deleteMany();

    createSuccessResponse(
      res,
      deletedAllCarModelColors,
      "All car models deleted"
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
