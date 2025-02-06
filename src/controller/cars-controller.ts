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

export const createCar: RequestHandler = async (req, res) => {
  try {
    const payload: UserCar = req.body;
    const images = req.files as Express.Multer.File[];

    if (!images || images.length <= 0) {
      return createErrorResponse(res, "images required", 400);
    }

    const createdCar = await prisma.userCar.create({
      data: {
        ...payload,
        imageUrls: images.map((image) => image.cloudinary?.secure_url!),
      },
    });

    console.log(createdCar);

    createSuccessResponse(res, createdCar, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
