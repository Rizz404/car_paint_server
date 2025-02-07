import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
import { UserCar } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyUserCars: RequestHandler = async (req, res) => {
  try {
    const payloads: UserCar[] = req.body;

    const userCarsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdUserCars = await prisma.userCar.createMany({
      data: userCarsToCreate,
      skipDuplicates: true,
    });

    return createSuccessResponse(
      res,
      createdUserCars,
      "User Cars Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple userCars:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createUserCar: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const payload: UserCar = req.body;

    const createdUserCar = await prisma.userCar.create({
      data: { ...payload, userId: id },
    });

    return createSuccessResponse(res, createdUserCar, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getUserCars: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const userCars = await prisma.userCar.findMany({
      where: { userId: id },
      include: {
        carModelYearColor: true,
      },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalUserCars = await prisma.userCar.count();

    createPaginatedResponse(
      res,
      userCars,
      currentPage,
      itemsPerPage,
      totalUserCars
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getUserCarById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { userCarId } = req.params;

    const userCar = await prisma.userCar.findUnique({
      where: { id: userCarId, userId: id },
      include: {
        carModelYearColor: true,
      },
    });

    if (!userCar) {
      return createErrorResponse(res, "User Car not found", 404);
    }

    return createSuccessResponse(res, userCar);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchUserCars: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const {
      page = "1",
      limit = "10",
      query,
    } = req.query as unknown as {
      page: string;
      limit: string;
      query: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const userCars = await prisma.userCar.findMany({
      where: {
        userId: id,
        // OR: [{ carBrand: { name: query } }, { carModel: { name: query } }],
      },
      include: {
        carModelYearColor: true,
      },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalUserCars = await prisma.userCar.count({
      where: {
        userId: id,
        // OR: [{ carBrand: { name: query } }, { carModel: { name: query } }],
      },
    });

    createPaginatedResponse(
      res,
      userCars,
      currentPage,
      itemsPerPage,
      totalUserCars
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateUserCar: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { userCarId } = req.params;

    const payload: UserCar = req.body;

    const userCar = await prisma.userCar.findUnique({
      where: {
        id: userCarId,
        userId: id,
      },
    });

    if (!userCar) {
      return createErrorResponse(res, "User Car Not Found", 500);
    }

    const updatedUserCar = await prisma.userCar.update({
      data: payload,
      where: { id: userCarId },
    });

    return createSuccessResponse(res, updatedUserCar, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteUserCar: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { userCarId } = req.params;

    const userCar = await prisma.userCar.findUnique({
      where: {
        id: userCarId,
        userId: id,
      },
    });

    if (!userCar) {
      return createErrorResponse(res, "User Car Not Found", 500);
    }

    const deletedUserCar = await prisma.userCar.delete({
      where: { id: userCarId },
    });

    return createSuccessResponse(res, deletedUserCar, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllUserCar: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;

    const deletedAllUserCars = await prisma.userCar.deleteMany({
      where: { userId: id },
    });

    return createSuccessResponse(
      res,
      deletedAllUserCars,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
