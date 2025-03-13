import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "./logger";

declare global {
  namespace Express {
    interface Request {
      io?: SocketServer;
    }
  }
}

export type OrderEventType =
  | "order:created"
  | "order:updated"
  | "order:cancelled"
  | "order:completed"
  | "order:started"
  | "order:payment:completed";

export interface OrderNotification {
  type: OrderEventType;
  orderId: string;
  userId: string;
  workshopId?: string;
  message: string;
  timestamp: Date;
  data?: any;
}

let io: SocketServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketServer => {
  if (io) return io;

  io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join user-specific room for targeted notifications
    socket.on("join:user", (userId: string) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      logger.info(`User ${userId} joined their room`);
    });

    // Join workshop-specific room for targeted notifications
    socket.on("join:workshop", (workshopId: string) => {
      if (!workshopId) return;
      socket.join(`workshop:${workshopId}`);
      logger.info(`Workshop ${workshopId} joined their room`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Send notification to specific user
 * @param userId User ID
 * @param notification Notification data
 */
export const sendUserNotification = (
  userId: string,
  notification: OrderNotification
): void => {
  if (!io) {
    logger.error("Socket.IO not initialized");
    return;
  }

  try {
    // Send to specific user room
    io.to(`user:${userId}`).emit("notification", notification);
    logger.info(`User notification sent to ${userId}`, notification);
  } catch (error) {
    logger.error("Error sending user notification:", error);
  }
};

/**
 * Send notification to specific workshop
 * @param workshopId Workshop ID
 * @param notification Notification data
 */
export const sendWorkshopNotification = (
  workshopId: string,
  notification: OrderNotification
): void => {
  if (!io) {
    logger.error("Socket.IO not initialized");
    return;
  }

  try {
    // Send to specific workshop room
    io.to(`workshop:${workshopId}`).emit("notification", notification);
    logger.info(`Workshop notification sent to ${workshopId}`, notification);
  } catch (error) {
    logger.error("Error sending workshop notification:", error);
  }
};

/**
 * Send notification to all connected clients
 * @param notification Notification data
 */
export const sendBroadcastNotification = (
  notification: OrderNotification
): void => {
  if (!io) {
    logger.error("Socket.IO not initialized");
    return;
  }

  try {
    io.emit("notification", notification);
    logger.info("Broadcast notification sent to all clients");
  } catch (error) {
    logger.error("Error sending broadcast notification:", error);
  }
};

/**
 * Get Socket.IO server instance
 * @returns Socket.IO server instance
 */
export const getSocketServer = (): SocketServer | null => {
  return io;
};
