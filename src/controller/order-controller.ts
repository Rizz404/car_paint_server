import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { parsePagination } from "@/utils/parse-pagination";
import { Order, OrderStatus, WorkStatus } from "@prisma/client";
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

    return createSuccessResponse(res, createdOrders, "Car models Created", 201);
  } catch (error) {
    logger.error("Error creating multiple orders:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const payload: Order = req.body;

    const createdOrder = await prisma.order.create({
      data: payload,
    });

    return createSuccessResponse(res, createdOrder, "Created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
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
    return createErrorResponse(res, error, 500);
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

    return createSuccessResponse(res, order);
  } catch (error) {
    return createErrorResponse(res, error, 500);
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
    return createErrorResponse(res, error, 500);
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
      return createErrorResponse(res, "Car model Not Found", 500);
    }

    const updatedOrder = await prisma.order.update({
      data: payload,
      where: { id: orderId },
    });

    return createSuccessResponse(res, updatedOrder, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
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
      return createErrorResponse(res, "Car model Not Found", 500);
    }

    const deletedOrder = await prisma.order.delete({
      where: { id: orderId },
    });

    return createSuccessResponse(res, deletedOrder, "Deleted");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const deleteAllOrder: RequestHandler = async (req, res) => {
  try {
    const deletedAllOrders = await prisma.order.deleteMany();

    return createSuccessResponse(
      res,
      deletedAllOrders,
      "All car models deleted"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// * Current user operations
export const getCurrentUserOrders: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const {
      page = "1",
      limit = "10",
      orderStatus,
      workStatus,
    } = req.query as unknown as {
      page: string;
      limit: string;
      orderStatus: OrderStatus;
      workStatus: WorkStatus;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

    const orders = await prisma.order.findMany({
      where: {
        userId: id,
        AND: [
          { ...(orderStatus && { orderStatus }) },
          { ...(workStatus && { workStatus }) },
        ],
      },
      skip: offset,
      take: +limit,
      orderBy: { createdAt: "desc" },
    });
    const totalOrders = await prisma.order.count({ where: { userId: id } });

    createPaginatedResponse(
      res,
      orders,
      currentPage,
      itemsPerPage,
      totalOrders
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
