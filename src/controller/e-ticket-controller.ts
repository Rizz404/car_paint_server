import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { ETicket } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyETickets: RequestHandler = async (req, res) => {
  try {
    const payloads: ETicket[] = req.body;

    const eTicketsToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdETickets = await prisma.eTicket.createMany({
      data: eTicketsToCreate,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    return createSuccessResponse(
      res,
      createdETickets,
      "E-tickets Created",
      201
    );
  } catch (error) {
    logger.error("Error creating multiple eTickets:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createETicket: RequestHandler = async (req, res) => {
  try {
    const payload: ETicket = req.body;

    const createdETicket = await prisma.eTicket.create({
      data: payload,
    });

    return createSuccessResponse(res, createdETicket, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getETickets: RequestHandler = async (req, res) => {
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
    const validFields = ["createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const eTickets = await prisma.eTicket.findMany({
      include: {
        order: {
          select: {
            workshop: { select: { name: true } },
            userCar: {
              select: {
                carModelYearColor: {
                  select: {
                    carModelYear: {
                      select: {
                        carModel: {
                          select: {
                            name: true,
                            carBrand: { select: { name: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalETickets = await prisma.eTicket.count();

    createPaginatedResponse(
      res,
      eTickets,
      currentPage,
      itemsPerPage,
      totalETickets
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const getETicketById: RequestHandler = async (req, res) => {
  try {
    const { eTicketId } = req.params;
    const eTicket = await prisma.eTicket.findUnique({
      include: {
        order: {
          select: {
            workshop: { select: { name: true } },
            userCar: {
              select: {
                carModelYearColor: {
                  select: {
                    carModelYear: {
                      select: {
                        carModel: {
                          select: {
                            name: true,
                            carBrand: { select: { name: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      where: { id: eTicketId },
    });

    if (!eTicket) {
      return createErrorResponse(res, "E-ticket not found", 404);
    }

    return createSuccessResponse(res, eTicket);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const searchETickets: RequestHandler = async (req, res) => {
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

    const eTickets = await prisma.eTicket.findMany({
      // where: { name: { contains: name } },
      include: {
        order: {
          select: {
            workshop: { select: { name: true } },
            userCar: {
              select: {
                carModelYearColor: {
                  select: {
                    carModelYear: {
                      select: {
                        carModel: {
                          select: {
                            name: true,
                            carBrand: { select: { name: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      skip: offset,
      take: +limit,
    });
    const totalETickets = await prisma.eTicket.count({});

    createPaginatedResponse(
      res,
      eTickets,
      currentPage,
      itemsPerPage,
      totalETickets
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateETicket: RequestHandler = async (req, res) => {
  try {
    const { eTicketId } = req.params;
    const payload: ETicket = req.body;

    const eTicket = await prisma.eTicket.findUnique({
      where: {
        id: eTicketId,
      },
    });

    if (!eTicket) {
      return createErrorResponse(res, "E-ticket Not Found", 500);
    }

    const updatedETicket = await prisma.eTicket.update({
      data: payload,
      where: { id: eTicketId },
    });

    return createSuccessResponse(res, updatedETicket, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteETicket: RequestHandler = async (req, res) => {
  try {
    const { eTicketId } = req.params;

    const eTicket = await prisma.eTicket.findUnique({
      where: {
        id: eTicketId,
      },
    });

    if (!eTicket) {
      return createErrorResponse(res, "E-ticket Not Found", 500);
    }

    const deletedETicket = await prisma.eTicket.delete({
      where: { id: eTicketId },
    });

    return createSuccessResponse(res, deletedETicket, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllETicket: RequestHandler = async (req, res) => {
  try {
    const deletedAllETickets = await prisma.eTicket.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllETickets,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// * Current user operations
export const getCurrentUserETickets: RequestHandler = async (req, res) => {
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
    const validFields = ["name", "createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

    const eTickets = await prisma.eTicket.findMany({
      where: { userId: id },
      include: {
        order: {
          select: {
            workshop: { select: { name: true } },
            userCar: {
              select: {
                carModelYearColor: {
                  select: {
                    carModelYear: {
                      select: {
                        carModel: {
                          select: {
                            name: true,
                            carBrand: { select: { name: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalETickets = await prisma.eTicket.count({ where: { userId: id } });

    createPaginatedResponse(
      res,
      eTickets,
      currentPage,
      itemsPerPage,
      totalETickets
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
