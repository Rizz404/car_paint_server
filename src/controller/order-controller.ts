import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
import { Order } from "@prisma/client";
import { RequestHandler } from "express";

// *======================= POST =======================*
export const createManyOrders: RequestHandler = async (req, res) => {
  try {
    const payloads: Order[] = req.body;

    const ordersToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdOrders = await prisma.order.createMany({
      data: ordersToCreate,
      skipDuplicates: true, // Optional: skip duplicate entries
    });

    createSuccessResponse(res, createdOrders, "Car models Created", 201);
  } catch (error) {
    logger.error("Error creating multiple orders:", error);
    createErrorResponse(res, error, 500);
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const payload: Order = req.body;

    const createdOrder = await prisma.order.create({
      data: payload,
    });

    createSuccessResponse(res, createdOrder, "Created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getOrders: RequestHandler = async (req, res) => {
  try {
    const { page = "1", limit = "10" } = req.query as unknown as {
      page: string;
      limit: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const orders = await prisma.order.findMany({
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalOrders = await prisma.order.count();

    createPaginatedResponse(
      res,
      orders,
      currentPage,
      itemsPerPage,
      totalOrders
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return createErrorResponse(res, "Car model not found", 404);
    }

    createSuccessResponse(res, order);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const searchOrders: RequestHandler = async (req, res) => {
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

    const orders = await prisma.order.findMany({
      // where: { name: { contains: name } },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalOrders = await prisma.order.count({
      // where: { name: { contains: name } },
    });

    createPaginatedResponse(
      res,
      orders,
      currentPage,
      itemsPerPage,
      totalOrders
    );
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= PATCH =======================*
export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payload: Order = req.body;

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const updatedOrder = await prisma.order.update({
      data: payload,
      where: { id: orderId },
    });

    createSuccessResponse(res, updatedOrder, "Updated");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

// *======================= DELETE =======================*
export const deleteOrder: RequestHandler = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      createErrorResponse(res, "Car model Not Found", 500);
    }

    const deletedOrder = await prisma.order.delete({
      where: { id: orderId },
    });

    createSuccessResponse(res, deletedOrder, "Deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const deleteAllOrder: RequestHandler = async (req, res) => {
  try {
    const deletedAllOrders = await prisma.order.deleteMany();

    createSuccessResponse(res, deletedAllOrders, "All car models deleted");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
