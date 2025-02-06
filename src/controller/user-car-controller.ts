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
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    createSuccessResponse(res, createdUserCars, "Car models Created", 201);
  } catch (error) {
    logger.error("Error creating multiple userCars:", error);
    createErrorResponse(res, error, 500);
  }
};

export const createUserCar: RequestHandler = async (req, res) => {
  try {
    const payload: UserCar = req.body;

    const createdUserCar = await prisma.userCar.create({
      data: payload,
    });

    createSuccessResponse(res, createdUserCar, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getUserCars: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const userCars = await prisma.userCar.findMany({
      include: {
        carBrand: { select: { name: true, imageUrl: true } },
        carModel: { select: { name: true } },
        carModelColor: { select: { name: true } },
        carModelYear: { select: { year: true } },
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
    createErrorResponse(res, error, 500);
  }
};

export const getUserCarById: RequestHandler = async (req, res) => {
  try {
    const { userCarId } = req.params;
    const userCar = await prisma.userCar.findUnique({
      where: { id: userCarId },
      include: {
        carBrand: { select: { name: true, imageUrl: true } },
        carModel: { select: { name: true } },
        carModelColor: { select: { name: true } },
        carModelYear: { select: { year: true } },
      },
    });

    if (!userCar) {
      return createErrorResponse(res, "Car model not found", 404);
    }

    createSuccessResponse(res, userCar);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const searchUserCars: RequestHandler = async (req, res) => {
  try {
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
        OR: [{ carBrand: { name: query } }, { carModel: { name: query } }],
      },
      include: {
        carBrand: { select: { name: true, imageUrl: true } },
        carModel: { select: { name: true } },
        carModelColor: { select: { name: true } },
        carModelYear: { select: { year: true } },
      },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalUserCars = await prisma.userCar.count({
      where: {},
    });

    createPaginatedResponse(
      res,
      userCars,
      currentPage,
      itemsPerPage,
      totalUserCars
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateUserCar: RequestHandler = async (req, res) => {
  try {
    const { userCarId } = req.params;
    const payload: UserCar = req.body;

    const userCar = await prisma.userCar.findUnique({
      where: {
        id: userCarId,
      },
    });

    if (!userCar) {
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const updatedUserCar = await prisma.userCar.update({
      data: payload,
      where: { id: userCarId },
    });

    createSuccessResponse(res, updatedUserCar, "Updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteUserCar: RequestHandler = async (req, res) => {
  try {
    const { userCarId } = req.params;

    const userCar = await prisma.userCar.findUnique({
      where: {
        id: userCarId,
      },
    });

    if (!userCar) {
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const deletedUserCar = await prisma.userCar.delete({
      where: { id: userCarId },
    });

    createSuccessResponse(res, deletedUserCar, "Deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteAllUserCar: RequestHandler = async (req, res) => {
  try {
    const deletedAllUserCars = await prisma.userCar.deleteMany();

    createSuccessResponse(res, deletedAllUserCars, "All car models deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
