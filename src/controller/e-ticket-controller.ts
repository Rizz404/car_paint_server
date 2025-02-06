import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
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

    createSuccessResponse(res, createdETickets, "Car models Created", 201);
  } catch (error) {
    logger.error("Error creating multiple eTickets:", error);
    createErrorResponse(res, error, 500);
  }
};

export const createETicket: RequestHandler = async (req, res) => {
  try {
    const payload: ETicket = req.body;

    const createdETicket = await prisma.eTicket.create({
      data: payload,
    });

    createSuccessResponse(res, createdETicket, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getETickets: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const eTickets = await prisma.eTicket.findMany({
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
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
    createErrorResponse(res, error, 500);
  }
};

export const getETicketById: RequestHandler = async (req, res) => {
  try {
    const { eTicketId } = req.params;
    const eTicket = await prisma.eTicket.findUnique({
      where: { id: eTicketId },
    });

    if (!eTicket) {
      return createErrorResponse(res, "Car model not found", 404);
    }

    createSuccessResponse(res, eTicket);
  } catch (error) {
    createErrorResponse(res, error, 500);
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
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalETickets = await prisma.eTicket.count({
      // where: { name: { contains: name } },
    });

    createPaginatedResponse(
      res,
      eTickets,
      currentPage,
      itemsPerPage,
      totalETickets
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
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
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const updatedETicket = await prisma.eTicket.update({
      data: payload,
      where: { id: eTicketId },
    });

    createSuccessResponse(res, updatedETicket, "Updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
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
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const deletedETicket = await prisma.eTicket.delete({
      where: { id: eTicketId },
    });

    createSuccessResponse(res, deletedETicket, "Deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteAllETicket: RequestHandler = async (req, res) => {
  try {
    const deletedAllETickets = await prisma.eTicket.deleteMany();

    createSuccessResponse(res, deletedAllETickets, "All car models deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// * Current user operations
export const getCurrentUserETickets: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const eTickets = await prisma.eTicket.findMany({
      where: { userId: id },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
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
    createErrorResponse(res, error, 500);
  }
};
