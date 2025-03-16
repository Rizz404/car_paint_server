import {
  createErrorResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import { sendToUser, broadcast, sendToRole } from "@/utils/socket-service";
import { Role } from "@prisma/client";
import { NextFunction, RequestHandler, Request, Response } from "express";

type CustomRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any> | any;

export const notify: CustomRequestHandler = async (req, res) => {
  try {
    const {
      userId,
      message,
      role,
    }: { userId?: string; message: string; role?: Role } = req.body;

    const notificationBase = {
      message,
      type: "testing",
      timestamp: new Date(Date.now()),
    };

    // Kirim ke user kalau ada userId
    if (userId) {
      sendToUser(userId, {
        ...notificationBase,
        data: "ini send to user",
      });
      logger.info(`Notification sent to user ${userId}`);
    }

    // Kirim ke role kalau ada role
    if (role) {
      let roleData = "ini send to role user";

      if (role === Role.SUPER_ADMIN) {
        roleData = "ini send to role super admin";
      } else if (role === Role.ADMIN) {
        roleData = "ini send to role admin";
      }

      sendToRole(role, {
        ...notificationBase,
        data: roleData,
      });
      logger.info(`Notification sent to role ${role}`);
    }

    // Kalau gak ada userId dan gak ada role → broadcast
    if (!userId && !role) {
      broadcast({
        ...notificationBase,
        data: "ini send ke all",
      });
      logger.info("Broadcast notification sent to all");
    }

    return createSuccessResponse(
      res,
      { success: "success bang" },
      "success bang",
      201
    );
  } catch (error) {
    logger.error("Error sending test notification:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const getStatus: CustomRequestHandler = async (req, res) => {
  try {
    const io = req.io;

    if (!io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO not initialized",
      });
    }

    const rooms = Array.from(io.sockets.adapter.rooms.keys())
      .filter(
        (room) => room.startsWith("user:") || room.startsWith("workshop:")
      )
      .map((room) => {
        const clients = io.sockets.adapter.rooms.get(room)?.size || 0;
        return { room, clients };
      });

    return createSuccessResponse(
      res,
      { success: "success bang" },
      "success bang",
      200
    );
  } catch (error) {
    logger.error("Error getting socket status:", error);
    return createErrorResponse(res, error, 500);
  }
};
