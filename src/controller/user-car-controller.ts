import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
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
    const carImages = req.files as Express.Multer.File[];

    const carImageUrls =
      carImages
        ?.map((carImage) => carImage.cloudinary?.url)
        .filter((url): url is string => typeof url === "string") || [];

    const createdUserCar = await prisma.userCar.create({
      data: {
        ...payload,
        userId: id,
        carImages: carImageUrls,
      },
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
    const validFields = ["licensePlate", "createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const userCars = await prisma.userCar.findMany({
      where: { userId: id },
      include: {
        carModelYearColor: {
          select: {
            carModelYear: {
              select: {
                year: true,
                carModel: {
                  select: { name: true, carBrand: { select: { name: true } } },
                },
              },
            },
            color: { select: { name: true } },
          },
        },
        user: { select: { username: true, email: true, profileImage: true } },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
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
        carModelYearColor: {
          select: {
            carModelYear: {
              select: {
                year: true,
                carModel: {
                  select: { name: true, carBrand: { select: { name: true } } },
                },
              },
            },
            color: { select: { name: true } },
          },
        },
        user: { select: { username: true, email: true, profileImage: true } },
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
      licensePlate,
    } = req.query as unknown as {
      page: string;
      limit: string;
      licensePlate: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const userCars = await prisma.userCar.findMany({
      where: {
        userId: id,
        licensePlate: { contains: licensePlate },
      },
      include: {
        carModelYearColor: {
          select: {
            carModelYear: {
              select: {
                year: true,
                carModel: {
                  select: { name: true, carBrand: { select: { name: true } } },
                },
              },
            },
            color: { select: { name: true } },
          },
        },
        user: { select: { username: true, email: true, profileImage: true } },
      },
      skip: offset,
      take: +limit,
    });
    const totalUserCars = await prisma.userCar.count({
      where: {
        userId: id,
        licensePlate: { contains: licensePlate },
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

    const payload: Omit<UserCar, "carImages"> = req.body;

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

// *======================= ADD & DELETE CAR IMAGES =======================*
export const addUserCarImage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { userCarId } = req.params;
    const carImages = req.files as Express.Multer.File[];

    const carImageUrls =
      carImages
        ?.map((carImage) => carImage.cloudinary?.url)
        .filter((url): url is string => typeof url === "string") || [];

    const userCar = await prisma.userCar.findUnique({
      where: {
        id: userCarId,
        userId: id,
      },
    });

    if (!userCar) {
      return createErrorResponse(res, "User Car Not Found", 404);
    }

    const existingCarImages = userCar.carImages || [];

    const updatedCarImages = [...existingCarImages, ...carImageUrls];

    const updatedUserCar = await prisma.userCar.update({
      where: { id: userCarId },
      data: {
        carImages: updatedCarImages,
      },
    });

    return createSuccessResponse(res, updatedUserCar, "Car Image Added");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteUserCarImage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { userCarId, index } = req.params;

    if (index === undefined) {
      return createErrorResponse(res, "Image index is required", 400);
    }

    const imageIndex = parseInt(index as string, 10);

    if (isNaN(imageIndex) || imageIndex < 0) {
      return createErrorResponse(res, "Invalid image index", 400);
    }

    const userCar = await prisma.userCar.findUnique({
      where: {
        id: userCarId,
        userId: id,
      },
    });

    if (!userCar) {
      return createErrorResponse(res, "User Car Not Found", 404);
    }

    if (!userCar.carImages || imageIndex >= userCar.carImages.length) {
      return createErrorResponse(
        res,
        "Image index out of bounds or no images available",
        400
      );
    }

    const updatedCarImages = userCar.carImages.filter(
      (_, i) => i !== imageIndex
    );

    const updatedUserCar = await prisma.userCar.update({
      where: { id: userCarId },
      data: {
        carImages: updatedCarImages,
      },
    });

    return createSuccessResponse(res, updatedUserCar, "Car Image Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
