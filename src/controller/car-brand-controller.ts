import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import {
  isCloudinaryUrl,
  deleteCloudinaryImage,
  deleteCloudinaryImages,
} from "@/utils/cloudinary";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { CarBrand } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyCarBrands: RequestHandler = async (req, res) => {
  try {
    const payloads: CarBrand[] = req.body;

    const logos = req.files as Express.Multer.File[];

    const carBrandsToCreate = payloads.map((payload, index) => ({
      ...payload,
      ...(logos &&
        logos[index] && {
          logo: logos[index].cloudinary?.secure_url!,
        }),
    }));

    const createdCarBrands = await prisma.carBrand.createMany({
      data: carBrandsToCreate,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    return createSuccessResponse(
      res,
      createdCarBrands,
      "Car brands Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple carBrands:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createCarBrand: RequestHandler = async (req, res) => {
  try {
    const payload: CarBrand = req.body;
    const logo = req.file as Express.Multer.File;

    const existingBrand = await prisma.carBrand.findUnique({
      where: { name: payload.name },
    });

    if (existingBrand) {
      return createErrorResponse(res, "Brand already exist", 400);
    }

    if (!logo) {
      return createErrorResponse(res, "Image is required", 400);
    }

    if (!logo.cloudinary?.secure_url) {
      return createErrorResponse(res, "Cloudinary error", 400);
    }

    const createdCarBrand = await prisma.carBrand.create({
      data: { ...payload, logo: logo.cloudinary.secure_url },
    });

    return createSuccessResponse(res, createdCarBrand, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getCarBrands: RequestHandler = async (req, res) => {
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

    const carBrands = await prisma.carBrand.findMany({
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalCarBrands = await prisma.carBrand.count();

    createPaginatedResponse(
      res,
      carBrands,
      currentPage,
      itemsPerPage,
      totalCarBrands
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getCarBrandById: RequestHandler = async (req, res) => {
  try {
    const { carBrandId } = req.params;
    const carBrand = await prisma.carBrand.findUnique({
      where: { id: carBrandId },
    });

    if (!carBrand) {
      return createErrorResponse(res, "Car brand not found", 404);
    }

    return createSuccessResponse(res, carBrand);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchCarBrands: RequestHandler = async (req, res) => {
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

    const carBrands = await prisma.carBrand.findMany({
      where: { name: { contains: name } },
      skip: offset,
      take: +limit,
    });
    const totalCarBrands = await prisma.carBrand.count({
      where: { name: { contains: name } },
    });

    createPaginatedResponse(
      res,
      carBrands,
      currentPage,
      itemsPerPage,
      totalCarBrands
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateCarBrand: RequestHandler = async (req, res) => {
  try {
    const { carBrandId } = req.params;
    const payload: CarBrand = req.body;
    const logo = req.file as Express.Multer.File;

    if (logo && !logo.cloudinary?.secure_url) {
      return createErrorResponse(res, "Cloudinary error", 400);
    }

    const carBrand = await prisma.carBrand.findUnique({
      where: {
        id: carBrandId,
      },
    });

    if (!carBrand) {
      return createErrorResponse(res, "Car brand Not Found", 404);
    }

    if (logo && logo.cloudinary && logo.cloudinary.secure_url) {
      const imageToDelete = carBrand.logo;

      if (isCloudinaryUrl(imageToDelete)) {
        await deleteCloudinaryImage(imageToDelete);
      }
    }

    const updatedCarBrand = await prisma.carBrand.update({
      data: {
        ...payload,
        ...(logo && logo.cloudinary && { logo: logo.cloudinary.secure_url }),
      },
      where: { id: carBrandId },
    });

    return createSuccessResponse(res, updatedCarBrand, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteCarBrand: RequestHandler = async (req, res) => {
  try {
    const { carBrandId } = req.params;

    const carBrand = await prisma.carBrand.findUnique({
      where: {
        id: carBrandId,
      },
    });

    if (!carBrand) {
      return createErrorResponse(res, "Car brand Not Found", 404);
    }

    const imageToDelete = carBrand.logo;

    if (isCloudinaryUrl(imageToDelete)) {
      await deleteCloudinaryImage(imageToDelete);
    }

    const deletedCarBrand = await prisma.carBrand.delete({
      where: { id: carBrandId },
    });

    return createSuccessResponse(res, deletedCarBrand, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllCarBrand: RequestHandler = async (req, res) => {
  try {
    const carBrands = await prisma.carBrand.findMany({
      select: { logo: true },
    });

    const allImages = carBrands.flatMap((car) => car.logo).filter((url) => url); // Remove null/undefined

    if (allImages.length > 0) {
      await deleteCloudinaryImages(allImages);
    }

    const deletedAllCarBrands = await prisma.carBrand.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllCarBrands,
      "All car brands deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
