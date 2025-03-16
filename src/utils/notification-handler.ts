import {
  Order,
  OrderStatus,
  PaymentStatus,
  Role,
  Transaction,
  WorkStatus,
} from "@prisma/client";
import { Notification } from "@/types/notification";
import { sendToRole, sendToUser, sendToWorkshopAdmin } from "./socket-service";
import prisma from "@/configs/database";

export const createOrderStatusNotification = async (
  order: Order
): Promise<void> => {
  const orderStatus = order.orderStatus;
  let message: string;

  switch (orderStatus) {
    case OrderStatus.CONFIRMED:
      message = "Your order has been confirmed";
      break;
    case OrderStatus.PROCESSING:
      message = "Your order is processing";
      break;
    case OrderStatus.CANCELLED:
      message = "Your order has been cancelled";
      break;
    case OrderStatus.COMPLETED:
      message = "Your order is completed";
      break;
    default:
      message = "Your order status has been updated";
  }

  try {
    const notification: Notification<Order> = {
      data: order,
      message,
      timestamp: new Date(),
      type: "order",
    };

    sendToUser(order.userId, notification, "order:update");

    const workshop = await prisma.workshop.findUnique({
      where: {
        id: order.workshopId,
      },
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    if (workshop && orderStatus !== OrderStatus.DRAFT) {
      const adminNotification: Notification<Order> = {
        data: order,
        message: `Order ${order.id} status updated to ${orderStatus}`,
        timestamp: new Date(),
        type: "order:admin",
      };

      sendToWorkshopAdmin(workshop.id, adminNotification, "order:update");

      workshop.users.forEach((user) => {
        sendToUser(user.id, adminNotification, "order:update");
      });
    }

    console.log(`Order notification sent for order ${order.id}`);
  } catch (error) {
    console.error("Error sending order notification:", error);
  }
};

export const createWorkStatusNotification = async (
  order: Order
): Promise<void> => {
  const workStatus = order.workStatus;
  let message: string;

  switch (workStatus) {
    case WorkStatus.QUEUED:
      message = "Your car has been queued for service";
      break;
    case WorkStatus.INSPECTION:
      message = "Your car is currently being inspected";
      break;
    case WorkStatus.PUTTY:
      message = "Your car is in the putty application phase";
      break;
    case WorkStatus.SURFACER:
      message = "Your car is in the surfacer application phase";
      break;
    case WorkStatus.APPLICATION_COLOR_BASE:
      message = "Color base is being applied to your car";
      break;
    case WorkStatus.APPLICATION_CLEAR_COAT:
      message = "Clear coat is being applied to your car";
      break;
    case WorkStatus.POLISHING:
      message = "Your car is in the polishing stage";
      break;
    case WorkStatus.FINAL_QC:
      message = "Your car is undergoing final quality control";
      break;
    case WorkStatus.COMPLETED:
      message = "Work on your car has been completed";
      break;
    case WorkStatus.CANCELLED:
      message = "Work on your car has been cancelled";
      break;
    default:
      message = "Your car's work status has been updated";
  }

  try {
    const notification: Notification<Order> = {
      data: order,
      message,
      timestamp: new Date(),
      type: "work_status",
    };

    sendToUser(order.userId, notification, "work_status:update");

    const workshop = await prisma.workshop.findUnique({
      where: {
        id: order.workshopId,
      },
      include: {
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    if (workshop) {
      const adminNotification: Notification<Order> = {
        data: order,
        message: `Order ${order.id} work status updated to ${workStatus}`,
        timestamp: new Date(),
        type: "work_status:admin",
      };

      sendToWorkshopAdmin(workshop.id, adminNotification, "work_status:update");

      workshop.users.forEach((user) => {
        sendToUser(user.id, adminNotification, "work_status:update");
      });
    }

    console.log(`Work status notification sent for order ${order.id}`);
  } catch (error) {
    console.error("Error sending work status notification:", error);
  }
};

export const createPaymentStatusNotification = async (
  transaction: Transaction,
  role?: Role
): Promise<void> => {
  const transactionStatus = transaction.paymentStatus;
  let message: string;

  switch (transactionStatus) {
    case PaymentStatus.SUCCESS:
      message = "Your transaction is succeded";
      break;
    case PaymentStatus.EXPIRED:
      message = "Your transaction is expired";
      break;
    case PaymentStatus.FAILED:
      message = "Your transaction is failed";
      break;
    case PaymentStatus.REFUNDED:
      message = "Your transaction is refunded";
      break;
    default:
      message = "Your transaction status has been updated";
  }

  try {
    const notification: Notification<Transaction> = {
      data: transaction,
      message,
      timestamp: new Date(),
      type: "transaction",
    };

    if (transactionStatus !== PaymentStatus.PENDING) {
      sendToUser(transaction.userId, notification, "transaction:update");

      const superAdmins = await prisma.user.findMany({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });

      const adminNotification: Notification<Transaction> = {
        data: transaction,
        message: `Transaction ${transaction.id} status updated to ${transactionStatus}`,
        timestamp: new Date(),
        type: "transaction:admin",
      };

      superAdmins.forEach((superAdmin) => {
        sendToUser(superAdmin.id, adminNotification, "transaction:update");
      });

      if (role) {
        sendToRole(role, adminNotification, "transaction:update");
      }
    }

    console.log(
      `Transaction notification sent for transaction ${transaction.id}`
    );
  } catch (error) {
    console.error("Error sending transaction notification:", error);
  }
};
