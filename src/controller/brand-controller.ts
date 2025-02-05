import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { Brand } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createBrand: RequestHandler = async (req, res) => {
  try {
    const payload: Brand = req.body;

    const createdBrand = await prisma.brand.create({ data: payload });

    createSuccessResponse(res, createdBrand, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getBrands: RequestHandler = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();

    createPaginatedResponse(res, brands, 1, 10, 18);
    console.log(brands);
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

// *======================= PATCH =======================*
export const updateBrand: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const payload: Brand = req.body;

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
