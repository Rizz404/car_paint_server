import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
import { Brand } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyBrands: RequestHandler = async (req, res) => {
  try {
    const payloads: Brand[] = req.body;

    // Validate if files are uploaded for each brand if required
    const images = req.files as Express.Multer.File[];

    // Map payloads to include cloudinary image URLs if images are present
    const brandsToCreate = payloads.map((payload, index) => ({
      ...payload,
      ...(images &&
        images[index] && {
          imageUrl: images[index].cloudinary?.secure_url!,
        }),
    }));

    const createdBrands = await prisma.brand.createMany({
      data: brandsToCreate,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    createSuccessResponse(res, createdBrands, "Brands Created", 201);
  } catch (error) {
    logger.error("Error creating multiple brands:", error);
    createErrorResponse(res, error, 500);
  }
};

export const createBrand: RequestHandler = async (req, res) => {
  try {
    const payload: Brand = req.body;
    const image = req.file as Express.Multer.File;

    const createdBrand = await prisma.brand.create({
      data: { ...payload, imageUrl: image.cloudinary?.secure_url! },
    });

    console.log(createdBrand);

    createSuccessResponse(res, createdBrand, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getBrands: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const brands = await prisma.brand.findMany({
      skip: offset,
      take: +limit,
      orderBy: { name: "asc" },
    });
    const totalBrands = await prisma.brand.count();

    createPaginatedResponse(
      res,
      brands,
      currentPage,
      itemsPerPage,
      totalBrands
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const getBrandById: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });

    if (!brand) {
      return createErrorResponse(res, "Brand not found", 404);
    }

    createSuccessResponse(res, brand);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const searchBrands: RequestHandler = async (req, res) => {
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

    const brands = await prisma.brand.findMany({
      where: { name: { contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalBrands = await prisma.brand.count({
      where: { name: { contains: name } },
    });

    createPaginatedResponse(
      res,
      brands,
      currentPage,
      itemsPerPage,
      totalBrands
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateBrand: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const payload: Brand = req.body;

    const brand = await prisma.brand.findUnique({
      where: {
        id: brandId,
      },
    });

    if (!brand) {
      createErrorResponse(res, "Brand Not Found", 500);
    }

    const updatedBrand = await prisma.brand.update({
      data: payload,
      where: { id: brandId },
    });

    createSuccessResponse(res, updatedBrand, "Updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteBrand: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;

    const deletedBrand = await prisma.brand.delete({
      where: { id: brandId },
    });

    createSuccessResponse(res, deletedBrand, "Deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteAllBrand: RequestHandler = async (req, res) => {
  try {
    const deletedAllBrands = await prisma.brand.deleteMany();

    createSuccessResponse(res, deletedAllBrands, "All brands deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
