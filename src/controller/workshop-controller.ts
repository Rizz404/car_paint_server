import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import { parsePagination } from "@/utils/parse-pagination";
import { Workshop } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= CREATE =======================*
export const createManyWorkshops: RequestHandler = async (req, res) => {
  try {
    const payloads: Workshop[] = req.body;

    const workshopsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdWorkshops = await prisma.workshop.createMany({
      data: workshopsToCreate,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    createSuccessResponse(res, createdWorkshops, "Car brands Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const createWorkshop: RequestHandler = async (req, res) => {
  try {
    const payload: Workshop = req.body;

    const createdWorkshop = await prisma.workshop.create({ data: payload });

    createSuccessResponse(res, createdWorkshop, "Workshop created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET ALL =======================*
export const getWorkshops: RequestHandler = async (req, res) => {
  try {
    const workshops = await prisma.workshop.findMany();

    createPaginatedResponse(res, workshops, 1, 10, workshops.length);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET BY ID =======================*
export const getWorkshopById: RequestHandler = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      return createErrorResponse(res, "Workshop not found", 404);
    }

    createSuccessResponse(res, workshop);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const searchWorkshops: RequestHandler = async (req, res) => {
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

    const workshops = await prisma.workshop.findMany({
      where: { name: { contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalWorkshops = await prisma.workshop.count({
      where: { name: { contains: name } },
    });

    createPaginatedResponse(
      res,
      workshops,
      currentPage,
      itemsPerPage,
      totalWorkshops
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= UPDATE =======================*
export const updateWorkshop: RequestHandler = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const payload: Workshop = req.body;

    const workshop = await prisma.workshop.findUnique({
      where: {
        id: workshopId,
      },
    });

    if (!workshop) {
      createErrorResponse(res, "Workshop Not Found", 500);
    }

    const updatedWorkshop = await prisma.workshop.update({
      data: payload,
      where: { id: workshopId },
    });

    createSuccessResponse(res, updatedWorkshop, "Workshop updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteWorkshop: RequestHandler = async (req, res) => {
  try {
    const { workshopId } = req.params;

    const deletedWorkshop = await prisma.workshop.delete({
      where: { id: workshopId },
    });

    createSuccessResponse(res, deletedWorkshop, "Workshop deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE ALL =======================*
export const deleteAllWorkshops: RequestHandler = async (req, res) => {
  try {
    const deletedAllWorkshops = await prisma.workshop.deleteMany();

    createSuccessResponse(res, deletedAllWorkshops, "All workshops deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
