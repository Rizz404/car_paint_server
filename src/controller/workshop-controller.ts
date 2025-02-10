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

    return createSuccessResponse(
      res,
      createdWorkshops,
      "Car brands Created",
      201
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const createWorkshop: RequestHandler = async (req, res) => {
  try {
    const payload: Workshop = req.body;

    const existingWorkshop = await prisma.workshop.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (existingWorkshop) {
      return createErrorResponse(res, "Workshop already exist", 400);
    }

    const createdWorkshop = await prisma.workshop.create({ data: payload });

    return createSuccessResponse(res, createdWorkshop, "Workshop created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getWorkshops: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const workshops = await prisma.workshop.findMany({
      skip: offset,
      take: +limit,
      orderBy: { name: "asc" },
    });
    const totalWorkshops = await prisma.workshop.count();

    createPaginatedResponse(
      res,
      workshops,
      currentPage,
      itemsPerPage,
      totalWorkshops
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
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

    return createSuccessResponse(res, workshop);
  } catch (error) {
    return createErrorResponse(res, error, 500);
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
    return createErrorResponse(res, error, 500);
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
      return createErrorResponse(res, "Workshop Not Found", 500);
    }

    const updatedWorkshop = await prisma.workshop.update({
      data: payload,
      where: { id: workshopId },
    });

    return createSuccessResponse(res, updatedWorkshop, "Workshop updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
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

    return createSuccessResponse(res, deletedWorkshop, "Workshop deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllWorkshops: RequestHandler = async (req, res) => {
  try {
    const deletedAllWorkshops = await prisma.workshop.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllWorkshops,
      "All workshops deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
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

    // Using the custom function to find nearest workshops
    const workshops = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        email: string;
        phoneNumber: string;
        address: string;
        latitude: string;
        longitude: string;
        createdAt: Date;
        updatedAt: Date;
        distance: string;
      }>
    >`
      SELECT 
        w.*,
        calculate_distance(
          ${Number(currentUser.latitude)}, 
          ${Number(currentUser.longitude)}, 
          w.latitude::decimal, 
          w.longitude::decimal
        )::text as distance
      FROM workshops w
      WHERE 
        CASE 
          WHEN ${maxDistance ? Number(maxDistance) : null}::decimal IS NOT NULL THEN
            calculate_distance(
              ${Number(currentUser.latitude)}, 
              ${Number(currentUser.longitude)}, 
              w.latitude::decimal, 
              w.longitude::decimal
            ) <= ${maxDistance ? Number(maxDistance) : null}::decimal
          ELSE TRUE
        END
      ORDER BY ST_SetSRID(ST_MakePoint(w.longitude::float8, w.latitude::float8), 4326)::geography <-> 
               ST_SetSRID(ST_MakePoint(${Number(currentUser.longitude)}::float8, ${Number(currentUser.latitude)}::float8), 4326)::geography
      LIMIT ${itemsPerPage}
      OFFSET ${offset}
    `;

    // Get total count for pagination
    const totalCount = await prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*)::integer
      FROM workshops w
      WHERE 
        CASE 
          WHEN ${maxDistance ? Number(maxDistance) : null}::decimal IS NOT NULL THEN
            calculate_distance(
              ${Number(currentUser.latitude)}, 
              ${Number(currentUser.longitude)}, 
              w.latitude::decimal, 
              w.longitude::decimal
            ) <= ${maxDistance ? Number(maxDistance) : null}::decimal
          ELSE TRUE
        END
    `;

    const formattedWorkshops = workshops.map((workshop) => ({
      ...workshop,
      distance: formatDistanceKmToM(workshop.distance),
    }));

    createPaginatedResponse(
      res,
      formattedWorkshops,
      currentPage,
      itemsPerPage,
      totalCount[0].count
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
