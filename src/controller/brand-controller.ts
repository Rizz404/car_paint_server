import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import { Brand } from "@prisma/client";
import { RequestHandler } from "express";

export const createBrand: RequestHandler = async (req, res) => {
  try {
    const payload: Brand = req.body;

    const createdBrand = await prisma.brand.create({ data: payload });

    createSuccessResponse(res, createdBrand, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const getBrands: RequestHandler = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();

    createPaginatedResponse(res, brands, 1, 10, 18);
    console.log(brands);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const updateBrand: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;
    const payload: Brand = req.body;

    const createdBrand = await prisma.brand.update({
      data: payload,
      where: { id: brandId },
    });

    createSuccessResponse(res, createdBrand, "Updated", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteBrand: RequestHandler = async (req, res) => {
  try {
    const { brandId } = req.params;

    const createdBrand = await prisma.brand.delete({
      where: { id: brandId },
    });

    createSuccessResponse(res, createdBrand, "Deleted", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
