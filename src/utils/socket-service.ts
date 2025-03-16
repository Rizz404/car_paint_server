import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "./logger";
import jwt from "jsonwebtoken";
import env from "../configs/environment";
import { Notification } from "@/types/notification";
import { Role, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      io?: SocketServer;
    }
  }
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

  // * Middleware untuk autentikasi socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    try {
      const decoded = jwt.verify(token as string, env.JWT_ACCESS_TOKEN);
      socket.data.user = decoded as Pick<
        User,
        "id" | "username" | "email" | "role"
      >;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;

    logger.info(
      `Client authenticated and connected: ${socket.id}, userId: ${userId}`
    );

    // * Auto-join user room based on authenticated user
    socket.join(`user:${userId}`);

    // * Bergabung dengan room berdasarkan role user
    if (socket.data.user.role) {
      socket.join(`role:${socket.data.user.role}`);
    }

    // * Kemampuan untuk bergabung dengan room kustom
    socket.on("join:room", (roomName: string) => {
      // * Implementasikan validasi dan logika yang sesuai
      if (isRoomJoinAllowed(socket.data.user, roomName)) {
        socket.join(roomName);
        logger.info(`User ${userId} joined room: ${roomName}`);
      } else {
        socket.emit("error", `Unauthorized to join room: ${roomName}`);
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// * Helper function to validate room joining permission
const isRoomJoinAllowed = (
  user: Pick<User, "id" | "username" | "email" | "role">,
  roomName: string
): boolean => {
  if (roomName.startsWith("admin:") && user.role !== "ADMIN") {
    return false;
  }

  return true;
};

// * Generic function untuk mengirim notifikasi ke pengguna
export const sendToUser = <T>(
  userId: string,
  notification: Notification<T>,
  eventName: string = "notification"
): void => {
  if (!io) {
    logger.error("Socket.IO not initialized");
    return;
  }

  try {
    io.to(`user:${userId}`).emit(eventName, notification);
    logger.info(`Sent ${eventName} to user ${userId}`, {
      type: notification.type,
    });
  } catch (error) {
    logger.error(`Error sending ${eventName} to user:`, error);
  }
};

// * Generic function untuk mengirim notifikasi ke pengguna
export const sendToWorkshopAdmin = <T>(
  workshopId: string,
  notification: Notification<T>,
  eventName: string = "notification"
): void => {
  if (!io) {
    logger.error("Socket.IO not initialized");
    return;
  }

  try {
    io.to(`workshop:${workshopId}`).emit(eventName, notification);
    logger.info(`Sent ${eventName} to workshop ${workshopId}`, {
      type: notification.type,
    });
  } catch (error) {
    logger.error(`Error sending ${eventName} to workshop:`, error);
  }
};

// * Generic function untuk mengirim notifikasi ke semua klien
export const broadcast = <T>(
  notification: Notification<T>,
  eventName: string = "notification"
): void => {
  if (!io) {
    logger.error("Socket.IO not initialized");
    return;
  }

  try {
    io.emit(eventName, notification);
    logger.info(`Broadcast ${eventName} sent`, { type: notification.type });
  } catch (error) {
    logger.error(`Error broadcasting ${eventName}:`, error);
  }
};

// * Generic function untuk mengirim ke room tertentu
export const sendToRoom = <T>(
  roomName: string,
  notification: Notification<T>,
  eventName: string = "notification"
): void => {
  if (!io) {
    logger.error("Socket.IO not initialized");
    return;
  }

  try {
    io.to(roomName).emit(eventName, notification);
    logger.info(`Sent ${eventName} to room ${roomName}`, {
      type: notification.type,
    });
  } catch (error) {
    logger.error(`Error sending ${eventName} to room:`, error);
  }
};

// * Generic function untuk mengirim notifikasi ke pengguna dengan role tertentu
export const sendToRole = <T>(
  role: Role,
  notification: Notification<T>,
  eventName: string = "notification"
): void => {
  if (!io) {
    logger.error("Socket.IO not initialized");
    return;
  }

  try {
    io.to(`role:${role}`).emit(eventName, notification);
    logger.info(`Sent ${eventName} to users with role ${role}`, {
      type: notification.type,
    });
  } catch (error) {
    logger.error(`Error sending ${eventName} to role:`, error);
  }
};

export const getSocketServer = (): SocketServer | null => {
  return io;
};
