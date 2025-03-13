// src/utils/notification-handler.ts
import { Order, OrderStatus, WorkStatus } from "@prisma/client";
import { Server as SocketServer } from "socket.io";
import logger from "./logger";
import {
  OrderEventType,
  OrderNotification,
  sendUserNotification,
  sendWorkshopNotification,
  sendBroadcastNotification,
} from "./socket-service";

/**
 * Creates a notification message for order events
 * @param type Event type
 * @param orderId Order ID
 * @param userId User ID
 * @param data Additional data
 * @returns Notification message
 */
const createOrderNotification = (
  type: OrderEventType,
  orderId: string,
  userId: string,
  workshopId?: string,
  data?: any
): OrderNotification => {
  let message = "";

  switch (type) {
    case "order:created":
      message = `New order #${orderId} has been created.`;
      break;
    case "order:updated":
      message = `Order #${orderId} has been updated.`;
      break;
    case "order:cancelled":
      message = `Order #${orderId} has been cancelled.`;
      break;
    case "order:completed":
      message = `Order #${orderId} has been completed.`;
      break;
    case "order:started":
      message = `Work on order #${orderId} has started.`;
      break;
    case "order:payment:completed":
      message = `Payment for order #${orderId} has been completed.`;
      break;
    default:
      message = `Order #${orderId} has been updated.`;
  }

  return {
    type,
    orderId,
    userId,
    workshopId,
    message,
    timestamp: new Date(),
    data,
  };
};

/**
 * Sends order notification to relevant parties
 * @param io Socket.IO server instance
 * @param type Event type
 * @param order Order data
 * @param data Additional data (optional)
 */
export const sendOrderNotification = (
  io: SocketServer,
  type: OrderEventType,
  order: {
    id: string;
    userId: string;
    workshopId?: string;
    [key: string]: any;
  },
  data?: any
): void => {
  try {
    const notification = createOrderNotification(
      type,
      order.id,
      order.userId,
      order.workshopId,
      data
    );

    // Notify the customer
    sendUserNotification(order.userId, notification);

    // If workshop exists, notify them too
    if (order.workshopId) {
      sendWorkshopNotification(order.workshopId, notification);
    }

    // Log the notification
    logger.info(`Order notification sent: ${type}`, { orderId: order.id });
  } catch (error) {
    logger.error("Error sending order notification:", error);
  }
};

/**
 * Legacy adapter for compatibility with existing code
 * @param io Socket.IO server instance
 * @param message Message
 */
export const sendNotification = (io: SocketServer, message: string): void => {
  try {
    sendBroadcastNotification({
      type: "order:created",
      orderId: "legacy",
      userId: "legacy",
      message,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("Error sending legacy notification:", error);
  }
};
