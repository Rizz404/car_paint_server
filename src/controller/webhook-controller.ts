import {
  createErrorResponse,
  createSuccessResponse,
} from "@/types/api-response";
import {
  XenditInvoiceWebhookPayload,
  XenditPaymentRequestWebhookPayload,
} from "@/types/xendit-webhook";
import logger from "@/utils/logger";
import { PrismaClient, Prisma, PaymentStatus } from "@prisma/client";
import { RequestHandler } from "express";
import env from "@/configs/environment";
import prisma from "@/configs/database";
import {
  createOrderStatusNotification,
  createPaymentStatusNotification,
} from "@/utils/notification-handler";
import { MidtransWebhookPayload } from "midtrans-client";

export const xenditInvoiceWebhook: RequestHandler = async (req, res) => {
  try {
    const callbackToken = req.headers["x-callback-token"];
    const { external_id: transactionId, status }: XenditInvoiceWebhookPayload =
      req.body;

    if (!callbackToken || callbackToken !== env.XENDIT_CALLBACK_TOKEN) {
      return createErrorResponse(res, "Unauthorized webhook request", 401);
    }

    if (transactionId === "invoice_123124123") {
      return createSuccessResponse(
        res,
        {},
        "Testing invoice webhook success",
        200
      );
    }

    const handleWebhookStatus = async (
      tx: Omit<
        PrismaClient,
        | "$connect"
        | "$disconnect"
        | "$on"
        | "$transaction"
        | "$use"
        | "$extends"
      >
    ) => {
      const transaction = await tx.transaction.findFirst({
        where: { id: transactionId },
        include: { cancellation: true, paymentDetail: true, refund: true },
      });

      if (!transaction) {
        throw new Error(`No transaction found: ${transactionId}`);
      }

      let updatedTransaction;
      let ticket;

      switch (status) {
        case "PAID":
          updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "SUCCESS",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "DRAFT" },
                },
              },
            },
            include: {
              order: true,
            },
          });

          const latestTicket = await tx.eTicket.findFirst({
            orderBy: {
              ticketNumber: "desc",
            },
          });

          const newTicketNumber = (latestTicket?.ticketNumber ?? 0) + 1;
          ticket = await tx.eTicket.create({
            data: {
              userId: updatedTransaction.userId,
              orderId: updatedTransaction.order[0].id,
              ticketNumber: newTicketNumber,
            },
          });

          return {
            transaction: updatedTransaction,
            ticket,
            order: updatedTransaction.order[0],
          };

        case "EXPIRED":
          if (transaction.cancellation && transaction.refund) {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "REFUNDED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          } else if (transaction.cancellation) {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "FAILED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          } else {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "EXPIRED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          }
          return {
            transaction: updatedTransaction,
            order: updatedTransaction.order[0],
          };

        case "STOPPED":
          updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "FAILED",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "CANCELLED" },
                },
              },
            },
            include: {
              order: true,
            },
          });
          return {
            transaction: updatedTransaction,
            order: updatedTransaction.order[0],
          };

        default:
          return {};
      }
    };

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await prisma.$transaction(
          async (tx) => handleWebhookStatus(tx),
          {
            timeout: 5000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          }
        );

        if (response.transaction) {
          await createPaymentStatusNotification(response.transaction);
        }

        if (response.order) {
          await createOrderStatusNotification(response.order);
        }

        return createSuccessResponse(
          res,
          response,
          "Webhook processed successfully",
          200
        );
      } catch (error) {
        lastError = error;
        logger.error(`Transaction attempt ${attempt} failed:`, error);
        if (attempt === 3) break;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    logger.error("All transaction attempts failed:", lastError);
    return createErrorResponse(
      res,
      "Error processing webhook after retries",
      500
    );
  } catch (error) {
    logger.error("Webhook processing error:", error);
    return createErrorResponse(res, "Error processing webhook", 500);
  }
};

export const xenditPaymentRequestWebhook: RequestHandler = async (req, res) => {
  try {
    const callbackToken = req.headers["x-callback-token"];
    const {
      data,
      business_id: businessId,
    }: XenditPaymentRequestWebhookPayload = req.body;
    const transactionId = data.reference_id;
    const paymentRequestStatus = data.status;

    if (!callbackToken || callbackToken !== env.XENDIT_CALLBACK_TOKEN) {
      return createErrorResponse(res, "Unauthorized webhook request", 401);
    }

    if (businessId === "sample_business_id") {
      return createSuccessResponse(
        res,
        {},
        "Testing payment request webhook success",
        200
      );
    }

    const handleWebhookStatus = async (
      tx: Omit<
        PrismaClient,
        | "$connect"
        | "$disconnect"
        | "$on"
        | "$transaction"
        | "$use"
        | "$extends"
      >
    ) => {
      const transaction = await tx.transaction.findFirst({
        where: {
          id: transactionId,
        },
        include: {
          cancellation: true,
          refund: true,
          paymentDetail: true,
        },
      });

      if (!transaction) {
        throw new Error(`No transaction found: ${transactionId}`);
      }

      let updatedTransaction;
      let ticket;

      switch (paymentRequestStatus) {
        case "SUCCEEDED":
          updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "SUCCESS",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "DRAFT" },
                },
              },
              paymentDetail: { update: { paidAt: data.updated } },
            },
            include: {
              order: true,
            },
          });

          const latestTicket = await tx.eTicket.findFirst({
            orderBy: {
              ticketNumber: "desc",
            },
          });

          const newTicketNumber = (latestTicket?.ticketNumber ?? 0) + 1;
          ticket = await tx.eTicket.create({
            data: {
              userId: updatedTransaction.userId,
              orderId: updatedTransaction.order[0].id,
              ticketNumber: newTicketNumber,
            },
          });

          return {
            transaction: updatedTransaction,
            ticket,
            order: updatedTransaction.order[0],
          };

        case "EXPIRED":
          if (transaction.cancellation && transaction.refund) {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "REFUNDED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          } else if (transaction.cancellation) {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "FAILED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          } else {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "EXPIRED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          }
          return {
            transaction: updatedTransaction,
            order: updatedTransaction.order[0],
          };

        case "STOPPED":
          updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "FAILED",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "CANCELLED" },
                },
              },
            },
            include: {
              order: true,
            },
          });
          return {
            transaction: updatedTransaction,
            order: updatedTransaction.order[0],
          };

        default:
          return {};
      }
    };

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await prisma.$transaction(
          async (tx) => handleWebhookStatus(tx),
          {
            timeout: 5000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          }
        );

        if (response.transaction) {
          await createPaymentStatusNotification(response.transaction);
        }

        if (response.order) {
          await createOrderStatusNotification(response.order);
        }

        return createSuccessResponse(
          res,
          response,
          "Webhook processed successfully",
          200
        );
      } catch (error) {
        lastError = error;
        logger.error(`Transaction attempt ${attempt} failed:`, error);
        if (attempt === 3) break;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    logger.error("All transaction attempts failed:", lastError);
    return createErrorResponse(
      res,
      "Error processing webhook after retries",
      500
    );
  } catch (error) {
    logger.error("Webhook processing error:", error);
    return createErrorResponse(res, "Error processing webhook", 500);
  }
};

export const midtransWebhook: RequestHandler = async (req, res) => {
  try {
    const serverKey = env.SANDBOX_MIDTRANS_SERVER_KEY;
    const payload: MidtransWebhookPayload = req.body;
    const {
      transaction_id: transactionIdFromMidtrans,
      order_id: transactionId,
      transaction_status: status,
      signature_key,
      status_code,
      gross_amount,
    } = payload;

    // * Validasinya kek gini dari dokumentasi
    const calculatedSignature = require("crypto")
      .createHash("sha512")
      .update(transactionId + status_code + gross_amount + serverKey)
      .digest("hex");

    if (signature_key !== calculatedSignature) {
      return createErrorResponse(res, "Invalid signature key", 401);
    }

    if (
      transactionId === "order_123124123" ||
      transactionId.startsWith("payment_notif_test")
    ) {
      return createSuccessResponse(
        res,
        {},
        "Testing Midtrans webhook success",
        200
      );
    }

    const handleWebhookStatus = async (
      tx: Omit<
        PrismaClient,
        | "$connect"
        | "$disconnect"
        | "$on"
        | "$transaction"
        | "$use"
        | "$extends"
      >
    ) => {
      const transaction = await tx.transaction.findFirst({
        where: { id: transactionId },
        include: { cancellation: true, paymentDetail: true, refund: true },
      });

      if (!transaction) {
        throw new Error(`No transaction found: ${transactionId}`);
      }

      let updatedTransaction;
      let ticket;

      switch (status) {
        case "settlement":
        case "capture":
          //  * Untuk bank transfers, e-wallets, etc. (settlement)
          //  * Untuk credit cards (capture dengan fraud_status check)

          // ! nanti credit card juga gak akan dipake sih
          // * Cek fraud status untuk credit card
          if (status === "capture" && payload.fraud_status === "challenge") {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "PENDING",
                // * Masih di review tunggu dulu aja
              },
              include: {
                order: true,
              },
            });
            return {
              transaction: updatedTransaction,
              order: updatedTransaction.order[0],
            };
          }

          updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "SUCCESS",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "DRAFT" },
                },
              },
              paymentDetail: {
                update: {
                  paidAt: new Date(payload.transaction_time),
                },
              },
            },
            include: {
              order: true,
            },
          });

          const latestTicket = await tx.eTicket.findFirst({
            orderBy: {
              ticketNumber: "desc",
            },
          });

          const newTicketNumber = (latestTicket?.ticketNumber ?? 0) + 1;
          ticket = await tx.eTicket.create({
            data: {
              userId: updatedTransaction.userId,
              orderId: updatedTransaction.order[0].id,
              ticketNumber: newTicketNumber,
            },
          });

          return {
            transaction: updatedTransaction,
            ticket,
            order: updatedTransaction.order[0],
          };

        case "pending":
          updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "PENDING",
            },
            include: {
              order: true,
            },
          });
          return {
            transaction: updatedTransaction,
            order: updatedTransaction.order[0],
          };

        case "expire":
          if (transaction.cancellation && transaction.refund) {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "REFUNDED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          } else if (transaction.cancellation) {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "FAILED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          } else {
            updatedTransaction = await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                paymentStatus: "EXPIRED",
                order: {
                  updateMany: {
                    where: { transactionId },
                    data: { orderStatus: "CANCELLED" },
                  },
                },
              },
              include: {
                order: true,
              },
            });
          }
          return {
            transaction: updatedTransaction,
            order: updatedTransaction.order[0],
          };

        case "cancel":
        case "deny":
          updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "FAILED",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "CANCELLED" },
                },
              },
            },
            include: {
              order: true,
            },
          });
          return {
            transaction: updatedTransaction,
            order: updatedTransaction.order[0],
          };

        case "refund":
        case "partial_refund":
          updatedTransaction = await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: "REFUNDED",
              order: {
                updateMany: {
                  where: { transactionId },
                  data: { orderStatus: "CANCELLED" },
                },
              },
            },
            include: {
              order: true,
            },
          });
          return {
            transaction: updatedTransaction,
            order: updatedTransaction.order[0],
          };

        default:
          return {};
      }
    };

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await prisma.$transaction(
          async (tx) => handleWebhookStatus(tx),
          {
            timeout: 5000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          }
        );

        if (response.transaction) {
          await createPaymentStatusNotification(response.transaction);
        }

        if (response.order) {
          await createOrderStatusNotification(response.order);
        }

        return createSuccessResponse(
          res,
          response,
          "Midtrans webhook processed successfully",
          200
        );
      } catch (error) {
        lastError = error;
        logger.error(`Transaction attempt ${attempt} failed:`, error);
        if (attempt === 3) break;
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    logger.error("All transaction attempts failed:", lastError);
    return createErrorResponse(
      res,
      "Error processing Midtrans webhook after retries",
      500
    );
  } catch (error) {
    logger.error("Midtrans webhook processing error:", error);
    console.log(error);
    return createErrorResponse(res, "Error processing Midtrans webhook", 500);
  }
};
