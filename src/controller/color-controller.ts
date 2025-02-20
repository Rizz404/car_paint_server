import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { Color } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyColors: RequestHandler = async (req, res) => {
  try {
    const payloads: Color[] = req.body;

    const colorsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdColors = await prisma.color.createMany({
      data: colorsToCreate,
      skipDuplicates: true,
    });

    return createSuccessResponse(res, createdColors, "Colors Created", 201);
  } catch (error) {
    logger.error("Error creating multiple colors:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createColor: RequestHandler = async (req, res) => {
  try {
    const payload: Color = req.body;

    const existingColor = await prisma.color.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (existingColor) {
      return createErrorResponse(res, "Colors exist", 400);
    }

    const createdColor = await prisma.color.create({
      data: { ...payload },
    });

    return createSuccessResponse(res, createdColor, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getColors: RequestHandler = async (req, res) => {
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

    const colors = await prisma.color.findMany({
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalColors = await prisma.color.count();

    createPaginatedResponse(
      res,
      colors,
      currentPage,
      itemsPerPage,
      totalColors
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getColorById: RequestHandler = async (req, res) => {
  try {
    const { colorId } = req.params;
    const color = await prisma.color.findUnique({
      where: { id: colorId },
    });

    if (!color) {
      return createErrorResponse(res, "Color not found", 404);
    }

    return createSuccessResponse(res, color);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchColors: RequestHandler = async (req, res) => {
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

    const colors = await prisma.color.findMany({
      where: { name: { mode: "insensitive", contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalColors = await prisma.color.count({
      where: { name: { mode: "insensitive", contains: name } },
    });

    createPaginatedResponse(
      res,
      colors,
      currentPage,
      itemsPerPage,
      totalColors
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateColor: RequestHandler = async (req, res) => {
  try {
    const { colorId } = req.params;
    const payload: Color = req.body;

    const color = await prisma.color.findUnique({
      where: {
        id: colorId,
      },
    });

    if (!color) {
      return createErrorResponse(res, "Color Not Found", 500);
    }

    const updatedColor = await prisma.color.update({
      data: payload,
      where: { id: colorId },
    });

    return createSuccessResponse(res, updatedColor, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteColor: RequestHandler = async (req, res) => {
  try {
    const { colorId } = req.params;

    const color = await prisma.color.findUnique({
      where: {
        id: colorId,
      },
    });

    if (!color) {
      return createErrorResponse(res, "Color Not Found", 500);
    }

    const deletedColor = await prisma.color.delete({
      where: { id: colorId },
    });

    return createSuccessResponse(res, deletedColor, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllColor: RequestHandler = async (req, res) => {
  try {
    const deletedAllColors = await prisma.color.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllColors,
      "All car brands deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
