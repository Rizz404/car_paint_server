import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import {
  calculateDistanceInKilometers,
  formatDistanceKmToM,
} from "@/utils/location";
import { parsePagination } from "@/utils/parse-pagination";
import { Workshop } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyWorkshops: RequestHandler = async (req, res) => {
  try {
    const payloads: Workshop[] = req.body;

    const workshopsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdWorkshops = await prisma.workshop.createMany({
      data: workshopsToCreate,
      skipDuplicates: true,
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

// *======================= GET =======================*
export const getWorkshops: RequestHandler = async (req, res) => {
  try {
    const workshops = await prisma.workshop.findMany();

    createPaginatedResponse(res, workshops, 1, 10, workshops.length);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

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

// *======================= PATCH =======================*
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

    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      return createErrorResponse(res, "Workshop not found", 404);
    }

    const deletedWorkshop = await prisma.workshop.delete({
      where: { id: workshopId },
    });

    createSuccessResponse(res, deletedWorkshop, "Workshop deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteAllWorkshops: RequestHandler = async (req, res) => {
  try {
    const deletedAllWorkshops = await prisma.workshop.deleteMany();

    createSuccessResponse(res, deletedAllWorkshops, "All workshops deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// * Current user operations
export const getCurrentUserNearestWorkshops: RequestHandler = async (
  req,
  res
) => {
  try {
    const { id } = req.user!;
    const {
      page = "1",
      limit = "10",
      maxDistance,
    } = req.query as {
      page?: string;
      limit?: string;
      maxDistance?: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const currentUser = await prisma.userProfile.findUnique({
      where: { userId: id },
      select: { latitude: true, longitude: true },
    });

    if (!currentUser?.latitude || !currentUser?.longitude) {
      return createErrorResponse(res, "Missing user coordinate", 400);
    }

    const workshops = await prisma.workshop.findMany({});

    const workshopDistances = await Promise.all(
      workshops.map(async (workshop) => {
        const distance = await calculateDistanceInKilometers(
          {
            latitude: currentUser.latitude!,
            longitude: currentUser.longitude!,
          },
          {
            latitude: workshop.latitude,
            longitude: workshop.longitude,
          }
        );

        return {
          ...workshop,
          distance: formatDistanceKmToM(distance || "0"),
          rawDistance: parseFloat(distance || "0"),
        };
      })
    );

    // * Filter dengan maxdistance
    const filteredWorkshops = maxDistance
      ? workshopDistances.filter(
          (workshop) => workshop.rawDistance <= parseFloat(maxDistance)
        )
      : workshopDistances;

    // * Sorting berdasarkan distance
    const sortedWorkshops = filteredWorkshops.sort(
      (a, b) => a.rawDistance - b.rawDistance
    );

    const paginatedWorkshops = sortedWorkshops.slice(
      offset,
      offset + itemsPerPage
    );

    const formattedWorkshops = paginatedWorkshops.map(
      ({ rawDistance, ...workshop }) => workshop
    );

    createPaginatedResponse(
      res,
      formattedWorkshops,
      currentPage,
      itemsPerPage,
      sortedWorkshops.length
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
