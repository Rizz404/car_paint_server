import prisma from "@/configs/database";
import env from "@/configs/environment";
import { midtransCoreApi } from "@/configs/midtrans";
import {
  xenditInvoiceClient,
  xenditPaymentMethodClient,
  xenditPaymentRequestClient,
  xenditRefundClient,
} from "@/configs/xendit";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import logger from "@/utils/logger";
import {
  mapToMidtransFraudStatus,
  mapToMidtransTransactionStatus,
} from "@/utils/midtrans";
import {
  createOrderStatusNotification,
  createWorkStatusNotification,
} from "@/utils/notification-handler";
import { parseOrderBy, parsePagination } from "@/utils/query";
import { createOrderSchema } from "@/validation/order-validation";
import {
  Cancellation,
  CancellationReason,
  MidtransFraudStatus,
  MidtransTransactionStatus,
  Order,
  OrderStatus,
  PaymentDetail,
  Prisma,
  WorkStatus,
} from "@prisma/client";
import { RequestHandler } from "express";
import { messaging } from "firebase-admin";
import {
  CoreApiChargeParameter,
  CustomerDetails,
  ItemDetails,
  CoreApiChargeResponse,
} from "midtrans-client";
import { PaymentRequestParameters } from "xendit-node/payment_request/models";
import { EWalletChannelCode } from "xendit-node/payment_request/models/EWalletChannelCode";
import { EWalletParameters } from "xendit-node/payment_request/models/EWalletParameters";
import { VirtualAccountChannelCode } from "xendit-node/payment_request/models/VirtualAccountChannelCode";
import { VirtualAccountParameters } from "xendit-node/payment_request/models/VirtualAccountParameters";
import { z } from "zod";

type CreateOrderDTO = z.infer<typeof createOrderSchema>["body"];

// *======================= POST =======================*
export const createManyOrders: RequestHandler = async (req, res) => {
  try {
    const payloads: Order[] = req.body;

    const ordersToCreate = payloads.map((payload, index) => ({
      ...payload,
    }));

    const createdOrders = await prisma.order.createMany({
      data: ordersToCreate,
      skipDuplicates: true,
    });

    return createSuccessResponse(res, createdOrders, "Orders Created", 201);
  } catch (error) {
    logger.error("Error creating multiple orders:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const {
      carServices,
      carModelYearId,
      colorId,
      workshopId,
      paymentMethodId,
      note,
    }: CreateOrderDTO & { paymentMethodId: string } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, userProfile: true },
    });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    if (!user.userProfile || !user.userProfile.phoneNumber) {
      return createErrorResponse(res, "Phone number is required", 400);
    }

    if (!carModelYearId || !colorId) {
      return createErrorResponse(
        res,
        "Car model year id and color id is required",
        400
      );
    }

    let carModelYearColor = await prisma.carModelYearColor.findUnique({
      where: {
        carModelYearId_colorId: {
          carModelYearId,
          colorId,
        },
      },
    });

    if (!carModelYearColor) {
      const [carModelYear, color] = await Promise.all([
        prisma.carModelYear.findUnique({ where: { id: carModelYearId } }),
        prisma.color.findUnique({ where: { id: colorId } }),
      ]);

      if (!carModelYear) {
        return createErrorResponse(res, "Car model year not found", 404);
      }

      if (!color) {
        return createErrorResponse(res, "Color not found", 404);
      }

      carModelYearColor = await prisma.carModelYearColor.create({
        data: {
          carModelYearId,
          colorId,
        },
      });
    }

    const carServicesData = await prisma.carService.findMany({
      where: {
        id: {
          in: carServices.map((service) => service.carServiceId),
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    if (carServicesData.length !== carServices.length) {
      const missingIds = carServices
        .filter(
          (service) =>
            !carServicesData.some((cs) => cs.id === service.carServiceId)
        )
        .map((service) => service.carServiceId);
      return createErrorResponse(
        res,
        `Missing car services: ${missingIds.join(", ")}`,
        404
      );
    }

    const orderTotalPrice = carServicesData.reduce(
      (sum, service) => sum.add(service.price),
      new Prisma.Decimal(0)
    );

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: { eWalletPaymentConfig: true, virtualAccountConfig: true },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
    }

    // * Fee admin saat ini 0
    const adminFee = new Prisma.Decimal(0);
    const paymentMethodFee = new Prisma.Decimal(paymentMethod.fee);

    // * Hitung total harga transaksi
    const transactionTotalPrice = orderTotalPrice
      .add(adminFee)
      .add(paymentMethodFee);

    // * Menambahkan opsi timeout yang lebih panjang untuk transaksi
    const result = await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            userId: user.id,
            paymentMethodId,
            adminFee,
            totalPrice: transactionTotalPrice,
            order: {
              create: {
                userId: user.id,
                carModelYearColorId: carModelYearColor.id,
                workshopId,
                note: note,
                subtotalPrice: orderTotalPrice,
                carServices: {
                  connect: carServicesData.map(({ id }) => ({ id })),
                },
              },
            },
          },
          include: { order: true },
        });

        try {
          const invoiceData = {
            amount: Number(transactionTotalPrice),
            externalId: transaction.id,
            payerEmail: user.email,
            currency: "IDR",
            invoiceDuration: "172800", // * 48 jam
            reminderTime: 1,
            paymentMethods: [paymentMethod.name],
            items: carServicesData.map((carserviceData) => ({
              name: carserviceData.name,
              price: Number(carserviceData.price),
              quantity: 1,
              category: "car service",
              referenceId: carserviceData.id,
            })),
            successRedirectUrl:
              "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
            failureRedirectUrl:
              "https://familiar-tomasina-happiness-overload-148b3187.koyeb.app",
            shouldSendEmail: true,
          };

          const invoiceResponse = await xenditInvoiceClient.createInvoice({
            data: invoiceData,
          });

          await tx.paymentDetail.create({
            data: {
              transactionId: transaction.id,
              webUrl: invoiceResponse.invoiceUrl,
              xenditInvoiceId: invoiceResponse.id,
            },
          });
        } catch (error) {
          throw error;
        }

        return transaction;
      },
      {
        timeout: 15000, // Menambahkan timeout 15 detik (dari default 5 detik)
      }
    );

    return createSuccessResponse(
      res,
      result,
      "Order created successfully",
      201
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const createOrderWithMidtrans: RequestHandler = async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const {
      carServices,
      carModelYearId,
      colorId,
      workshopId,
      paymentMethodId,
      note,
      cardTokenId,
    }: CreateOrderDTO = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        userProfile: {
          select: {
            fullname: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }
    if (!user.userProfile || !user.userProfile.phoneNumber) {
      return createErrorResponse(
        res,
        "User profile or phone number is required",
        400
      );
    }

    if (!carModelYearId || !colorId) {
      return createErrorResponse(
        res,
        "Car model year id and color id is required",
        400
      );
    }
    let carModelYearColor = await prisma.carModelYearColor.findUnique({
      where: { carModelYearId_colorId: { carModelYearId, colorId } },
    });
    if (!carModelYearColor) {
      const [carModelYear, color] = await Promise.all([
        prisma.carModelYear.findUnique({ where: { id: carModelYearId } }),
        prisma.color.findUnique({ where: { id: colorId } }),
      ]);
      if (!carModelYear)
        return createErrorResponse(res, "Car model year not found", 404);
      if (!color) return createErrorResponse(res, "Color not found", 404);
      carModelYearColor = await prisma.carModelYearColor.create({
        data: { carModelYearId, colorId },
      });
    }

    const carServiceIds = carServices.map((service) => service.carServiceId);
    const carServicesData = await prisma.carService.findMany({
      where: { id: { in: carServiceIds } },
      select: { id: true, name: true, price: true },
    });
    if (carServicesData.length !== carServiceIds.length) {
      const missingIds = carServiceIds.filter(
        (id) => !carServicesData.some((cs) => cs.id === id)
      );
      return createErrorResponse(
        res,
        `Missing car services: ${missingIds.join(", ")}`,
        404
      );
    }
    const orderSubtotalPrice = carServicesData.reduce(
      (sum, service) => sum.add(service.price),
      new Prisma.Decimal(0)
    );

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
    }
    if (!paymentMethod.isActive) {
      return createErrorResponse(res, "Payment method is not active", 400);
    }
    if (!paymentMethod.midtransIdentifier) {
      return createErrorResponse(
        res,
        "Payment method configuration for Midtrans is missing",
        500
      );
    }

    // * Validate Credit Card Token (jika relevan) (sudah ada di kode asli)
    if (paymentMethod.midtransIdentifier === "credit_card" && !cardTokenId) {
      return createErrorResponse(
        res,
        "Card Token ID is required for credit card payments",
        400
      );
    }

    const adminFee = new Prisma.Decimal(paymentMethod.fee ?? 0);
    const transactionTotalPrice = orderSubtotalPrice.add(adminFee);
    if (transactionTotalPrice.lessThan(paymentMethod.minimumPayment)) {
      return createErrorResponse(
        res,
        `Minimum payment amount is ${paymentMethod.minimumPayment}`,
        400
      );
    }
    if (transactionTotalPrice.greaterThan(paymentMethod.maximumPayment)) {
      return createErrorResponse(
        res,
        `Maximum payment amount is ${paymentMethod.maximumPayment}`,
        400
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            userId: user.id,
            paymentMethodId: paymentMethod.id,
            adminFee,
            totalPrice: transactionTotalPrice,
            order: {
              create: {
                userId: user.id,
                carModelYearColorId: carModelYearColor.id,
                workshopId,
                note: note,
                subtotalPrice: orderSubtotalPrice,
                carServices: {
                  connect: carServicesData.map(({ id }) => ({ id })),
                },
              },
            },
          },
          include: { order: { select: { id: true } } },
        });

        const midtransOrderId = transaction.id;

        const customerDetails: CustomerDetails = {
          first_name:
            user.userProfile?.fullname?.split(" ")[0] ?? user.username,
          last_name:
            user.userProfile?.fullname?.split(" ").slice(1).join(" ") ||
            undefined,
          email: user.email,
          phone: user.userProfile!.phoneNumber!,
        };

        const itemDetails: ItemDetails[] = carServicesData.map((service) => ({
          id: service.id,
          price: Number(service.price),
          quantity: 1,
          name: service.name.substring(0, 50),
          category: "Car Service",
        }));
        if (adminFee.greaterThan(0)) {
          itemDetails.push({
            id: "ADMIN_FEE",
            price: Number(adminFee),
            quantity: 1,
            name: "Biaya Admin",
          });
        }

        let paymentParameter: CoreApiChargeParameter;

        const baseParameter: Omit<
          CoreApiChargeParameter,
          | "payment_type"
          | "credit_card"
          | "bank_transfer"
          | "echannel"
          | "gopay"
          | "shopeepay"
          | "cstore"
          | "qris"
          | "dana"
          | "akulaku"
          | "kredivo"
        > = {
          transaction_details: {
            order_id: midtransOrderId,
            gross_amount: Number(transactionTotalPrice),
          },
          customer_details: customerDetails,
          item_details: itemDetails,
          expiry: {
            unit: "day",
            duration: 2,
          },
        };

        switch (paymentMethod.midtransIdentifier) {
          case "credit_card":
            paymentParameter = {
              ...baseParameter,
              payment_type: "credit_card",
              credit_card: {
                token_id: cardTokenId!,
                authentication: true, // * 3DS enabled
              },
            };
            break;
          case "bca_va":
          case "bni_va":
          case "bri_va":
          case "permata_va":
          case "cimb_va":
          case "bsi_va":
          case "mandiri_va":
            const bankCode = paymentMethod.midtransIdentifier.split("_")[0];
            paymentParameter = {
              ...baseParameter,
              payment_type: "bank_transfer",
              bank_transfer: {
                bank: bankCode as any,
              },
            };
            break;
          case "echannel":
            paymentParameter = {
              ...baseParameter,
              payment_type: "echannel",
              echannel: {
                bill_info1: `Order ID: ${midtransOrderId}`,
                bill_info2: `Pembayaran Jasa Mobil ${user.username}`,
              },
            };
            break;
          case "gopay":
            paymentParameter = {
              ...baseParameter,
              payment_type: "gopay",
              gopay: { enable_callback: true, callback_url: env.CALLBACK_URL }, // Optional
            };
            break;
          case "qris":
            paymentParameter = {
              ...baseParameter,
              payment_type: "qris",
              // qris: { acquirer: 'gopay' } // Optional
            };
            break;
          case "shopeepay":
            paymentParameter = {
              ...baseParameter,
              payment_type: "shopeepay",
              shopeepay: {
                callback_url: env.CALLBACK_URL,
              },
            };
            break;
          case "alfamart":
          case "indomaret":
            paymentParameter = {
              ...baseParameter,
              payment_type: "cstore",
              cstore: {
                store: paymentMethod.midtransIdentifier,
                message: `Pembayaran Order ${midtransOrderId}`,
              },
            };
            break;

          case "dana":
            paymentParameter = {
              ...baseParameter,
              payment_type: "dana",
              dana: { callback_url: env.CALLBACK_URL },
            };
            break;
          case "akulaku": // Akulaku PayLater
            paymentParameter = {
              ...baseParameter,
              payment_type: "akulaku",
            };
            break;
          case "kredivo": // Kredivo PayLater
            paymentParameter = {
              ...baseParameter,
              payment_type: "kredivo",
            };
            break;

          default:
            throw new Error(
              `Unsupported Midtrans identifier configured: ${paymentMethod.midtransIdentifier}`
            );
        }

        let chargeResponse: CoreApiChargeResponse;
        try {
          chargeResponse = await midtransCoreApi.charge(paymentParameter);
          console.log(
            "Midtrans Charge Response:",
            JSON.stringify(chargeResponse, null, 2)
          );
        } catch (error: any) {
          console.error(
            "Midtrans Charge Error:",
            error?.message || error,
            "Payload:",
            JSON.stringify(paymentParameter, null, 2) // Log payload on error
          );

          const midtransErrorMessage =
            error?.ApiResponse?.status_message ||
            error?.message ||
            "Unknown error";
          throw new Error(
            `Failed to create Midtrans transaction: ${midtransErrorMessage}`
          );
        }

        if (!["200", "201"].includes(chargeResponse.status_code)) {
          throw new Error(
            `Midtrans charge failed with status ${chargeResponse.status_code}: ${chargeResponse.status_message}`
          );
        }

        const paymentDetail = await tx.paymentDetail.create({
          data: {
            transactionId: transaction.id,
            midtransTransactionId: chargeResponse.transaction_id,
            midtransOrderId: chargeResponse.order_id,
            midtransPaymentType: chargeResponse.payment_type,
            midtransTransactionStatus: mapToMidtransTransactionStatus(
              chargeResponse.transaction_status
            ),
            midtransFraudStatus: mapToMidtransFraudStatus(
              chargeResponse.fraud_status
            ),
            midtransPaymentCode: chargeResponse.payment_code, // CStore
            midtransBillKey: chargeResponse.bill_key, // Mandiri Bill
            midtransBillerCode: chargeResponse.biller_code, // Mandiri Bill
            midtransQrCodeUrl: chargeResponse.actions?.find(
              (a) => a.name === "generate-qr-code"
            )?.url, // QRIS/GoPay/Dana
            midtransRedirectUrl: chargeResponse.redirect_url, // CC 3DS, Akulaku, Kredivo, ShopeePay redirect (jika tdk pakai callback)
            // Generic/Shared Fields
            virtualAccountNumber:
              chargeResponse.va_numbers?.[0]?.va_number ??
              chargeResponse.permata_va_number,
            webUrl: chargeResponse.redirect_url, // Prioritaskan redirect URL untuk web
            deeplinkUrl:
              chargeResponse.actions?.find(
                (a) => a.name === "deeplink-redirect"
              )?.url ?? // GoPay/ShopeePay/Dana deeplink
              chargeResponse.actions?.find(
                (a) => a.name === "deeplink-web-redirect" // Sometimes web deeplink exists
              )?.url,
            // paidAt will be updated via webhook
            // Todo: mungkin nanti ditambahkan
            // expiryTime: chargeResponse.expiry_time
            //   ? new Date(chargeResponse.expiry_time)
            //   : undefined, // Simpan expiry time jika ada
          },
        });

        // Prepare Response for Frontend (sudah ada di kode asli)
        const frontendResponseData = {
          orderId: transaction.order?.[0]?.id ?? midtransOrderId, // prefer internal order ID
          transactionId: transaction.id,
          midtransTransactionId: chargeResponse.transaction_id,
          paymentStatus: transaction.paymentStatus, // Initial internal status (PENDING)
          midtransInitialStatus: chargeResponse.transaction_status,
          totalAmount: transactionTotalPrice,
          paymentDetails: {
            paymentType: chargeResponse.payment_type,
            vaNumber:
              chargeResponse.va_numbers?.[0]?.va_number ??
              chargeResponse.permata_va_number,
            paymentCode: chargeResponse.payment_code, // CStore
            billKey: chargeResponse.bill_key, // Mandiri Bill
            billerCode: chargeResponse.biller_code, // Mandiri Bill
            qrCodeUrl: chargeResponse.actions?.find(
              (a) => a.name === "generate-qr-code"
            )?.url, // QRIS/GoPay/Dana
            deeplinkUrl:
              chargeResponse.actions?.find(
                (a) => a.name === "deeplink-redirect"
              )?.url ??
              chargeResponse.actions?.find(
                (a) => a.name === "deeplink-web-redirect"
              )?.url, // Deeplink Mobile/Web
            redirectUrl: chargeResponse.redirect_url, // CC 3DS, Akulaku, Kredivo, Shopee etc.
            expiryTime: chargeResponse.expiry_time, // Send expiry time to frontend
          },
        };

        return frontendResponseData;
      },
      {
        timeout: 20000, // * 20 seconds timeout for external API call
      }
    );

    return createSuccessResponse(
      res,
      result,
      "Order created and payment initiated successfully",
      201
    );
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return createErrorResponse(
      res,
      error?.message || "Failed to create order",
      error?.statusCode ||
        (error.message.startsWith("Midtrans charge failed") ? 400 : 500)
    );
  }
};

export const createOrderWithPaymentRequest: RequestHandler = async (
  req,
  res
) => {
  try {
    const { id: userId } = req.user!;
    const {
      carServices,
      paymentMethodId,
      carModelYearId,
      colorId,
      workshopId,
      note,
    }: CreateOrderDTO & { paymentMethodId: string } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, userProfile: true },
    });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    if (!user.userProfile || !user.userProfile.phoneNumber) {
      return createErrorResponse(res, "Phone number is required", 400);
    }

    if (!carModelYearId || !colorId) {
      return createErrorResponse(
        res,
        "Car model year id and color id is required",
        400
      );
    }

    let carModelYearColor = await prisma.carModelYearColor.findUnique({
      where: {
        carModelYearId_colorId: {
          carModelYearId,
          colorId,
        },
      },
    });

    if (!carModelYearColor) {
      const [carModelYear, color] = await Promise.all([
        prisma.carModelYear.findUnique({ where: { id: carModelYearId } }),
        prisma.color.findUnique({ where: { id: colorId } }),
      ]);

      if (!carModelYear) {
        return createErrorResponse(res, "Car model year not found", 404);
      }

      if (!color) {
        return createErrorResponse(res, "Color not found", 404);
      }

      carModelYearColor = await prisma.carModelYearColor.create({
        data: {
          carModelYearId,
          colorId,
        },
      });
    }

    const carServicesData = await prisma.carService.findMany({
      where: {
        id: {
          in: carServices.map((service) => service.carServiceId),
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    if (carServicesData.length !== carServices.length) {
      const missingIds = carServices
        .filter(
          (service) =>
            !carServicesData.some((cs) => cs.id === service.carServiceId)
        )
        .map((service) => service.carServiceId);
      return createErrorResponse(
        res,
        `Missing car services: ${missingIds.join(", ")}`,
        404
      );
    }

    const orderTotalPrice = carServicesData.reduce(
      (sum, service) => sum.add(service.price),
      new Prisma.Decimal(0)
    );

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: { eWalletPaymentConfig: true, virtualAccountConfig: true },
    });

    if (!paymentMethod) {
      return createErrorResponse(res, "Payment method not found", 404);
    }

    // Todo: Uncoment kalo udah fix
    // if (
    //   paymentMethod.type !== "EWALLET" &&
    //   paymentMethod.type !== "VIRTUAL_ACCOUNT"
    // ) {
    //   return createErrorResponse(res, "Unsupported payment method type", 400);
    // }

    const adminFee = new Prisma.Decimal(0);
    const paymentMethodFee = new Prisma.Decimal(paymentMethod.fee);
    const transactionTotalPrice = orderTotalPrice
      .add(adminFee)
      .add(paymentMethodFee);

    // Menambahkan opsi timeout yang lebih panjang untuk transaksi
    const result = await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            userId: user.id,
            paymentMethodId,
            adminFee,
            totalPrice: transactionTotalPrice,
            order: {
              create: {
                userId: user.id,
                carModelYearColorId: carModelYearColor.id, // Use the found or created record
                workshopId,
                note: note,
                subtotalPrice: orderTotalPrice,
                carServices: {
                  connect: carServicesData.map(({ id }) => ({ id })),
                },
              },
            },
          },
          include: { order: true },
        });

        try {
          const paymentRequestData: PaymentRequestParameters = {
            referenceId: transaction.id,
            amount: Number(transactionTotalPrice),
            currency: "IDR",
            description: note,
            items: carServicesData.map((service) => ({
              name: service.name,
              price: Number(service.price),
              currency: "IDR",
              quantity: 1,
              category: "CAR_SERVICE",
              referenceId: service.id,
              type: "SERVICE",
            })),
            paymentMethod: {
              referenceId: transaction.id,
              type: paymentMethod.type,
              reusability: paymentMethod.reusability,
            },
          };

          if (paymentMethod.type === "EWALLET") {
            if (!paymentMethod.eWalletPaymentConfig) {
              throw new Error("E-Wallet configuration not found");
            }

            if (!paymentRequestData.paymentMethod) {
              throw new Error(
                "Base payment method in payment request not found"
              );
            }

            paymentRequestData.paymentMethod.ewallet = {
              channelCode: paymentMethod.eWalletPaymentConfig
                .channelCode as EWalletChannelCode,
              channelProperties: {
                ...(user.userProfile?.phoneNumber && {
                  mobileNumber: user.userProfile.phoneNumber,
                }),
                ...(paymentMethod.eWalletPaymentConfig.successReturnUrl && {
                  successReturnUrl:
                    paymentMethod.eWalletPaymentConfig.successReturnUrl,
                }),
                ...(paymentMethod.eWalletPaymentConfig.failureReturnUrl && {
                  failureReturnUrl:
                    paymentMethod.eWalletPaymentConfig.failureReturnUrl,
                }),
              },
            };
          } else if (paymentMethod.type === "VIRTUAL_ACCOUNT") {
            if (!paymentMethod.virtualAccountConfig) {
              throw new Error("Virtual Account configuration not found");
            }

            if (!paymentRequestData.paymentMethod) {
              throw new Error(
                "Base payment method in payment request not found"
              );
            }

            paymentRequestData.paymentMethod.virtualAccount = {
              channelCode: paymentMethod.virtualAccountConfig
                .bankCode as VirtualAccountChannelCode,
              channelProperties: {
                customerName: user.username,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              },
            };
          }

          const paymentResponse =
            await xenditPaymentRequestClient.createPaymentRequest({
              data: paymentRequestData,
            });

          const deeplink = paymentResponse.actions?.find(
            (a) => a.urlType === "DEEPLINK"
          )?.url;
          const mobileUrl = paymentResponse.actions?.find(
            (a) => a.urlType === "MOBILE"
          )?.url;
          const webUrl = paymentResponse.actions?.find(
            (a) => a.urlType === "WEB"
          )?.url;
          const virtualAccountNumber =
            paymentResponse.paymentMethod.virtualAccount?.channelProperties
              .virtualAccountNumber;

          await tx.paymentDetail.create({
            data: {
              transactionId: transaction.id,
              xenditPaymentMethodId: paymentResponse.paymentMethod.id,
              xenditPaymentRequestId: paymentResponse.id,
              deeplinkUrl: deeplink,
              mobileUrl,
              webUrl,
              virtualAccountNumber,
            },
          });

          return transaction.order;
        } catch (error) {
          throw error;
        }
      },
      {
        timeout: 15000, // Menambahkan timeout 15 detik (dari default 5 detik)
      }
    );

    return createSuccessResponse(
      res,
      result,
      "Order created successfully",
      201
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

// *======================= GET =======================*
export const getOrders: RequestHandler = async (req, res) => {
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

    const orders = await prisma.order.findMany({
      include: {
        carModelYearColor: {
          select: {
            carModelYear: {
              select: {
                id: true,
                year: true,
                carModel: {
                  select: {
                    id: true,
                    name: true,
                    carBrand: { select: { id: true, name: true } },
                  },
                },
              },
            },
            color: { select: { id: true, name: true } },
          },
        },
        user: {
          select: { id: true, username: true, email: true, profileImage: true },
        },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
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

export const getOrdersByWorkshopId: RequestHandler = async (req, res) => {
  try {
    const { workshopId } = req.params;
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

    const orders = await prisma.order.findMany({
      where: { workshopId },
      include: {
        carModelYearColor: {
          select: {
            carModelYear: {
              select: {
                id: true,
                year: true,
                carModel: {
                  select: {
                    id: true,
                    name: true,
                    carBrand: { select: { id: true, name: true } },
                  },
                },
              },
            },
            color: { select: { id: true, name: true } },
          },
        },
        user: {
          select: { id: true, username: true, email: true, profileImage: true },
        },
      },
      skip: offset,
      take: +limit,
      orderBy: { [field]: direction },
    });
    const totalOrders = await prisma.order.count({ where: { workshopId } });

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
      include: {
        carModelYearColor: {
          select: {
            carModelYear: {
              select: {
                id: true,
                year: true,
                carModel: {
                  select: {
                    id: true,
                    name: true,
                    carBrand: { select: { id: true, name: true } },
                  },
                },
              },
            },
            color: { select: { id: true, name: true } },
          },
        },
        user: {
          select: { id: true, username: true, email: true, profileImage: true },
        },
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order not found", 404);
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
      // * where: { name: {mode: "insensitive", contains: name } },
      skip: offset,
      take: +limit,
    });
    const totalOrders = await prisma.order.count({
      // * where: { name: {mode: "insensitive", contains: name } },
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
      return createErrorResponse(res, "Order Not Found", 500);
    }

    const updatedOrder = await prisma.order.update({
      data: payload,
      where: { id: orderId },
    });

    if (order.orderStatus !== updatedOrder.orderStatus) {
      createOrderStatusNotification(updatedOrder);
    }

    if (order.workStatus !== updatedOrder.workStatus) {
      createWorkStatusNotification(updatedOrder);
    }

    return createSuccessResponse(res, updatedOrder, "Updated");
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const cancelOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.user!;
    const { orderId } = req.params;
    const { reason, notes }: Partial<Cancellation> = req.body;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        ...(user.role === "USER" && { userId: id }),
      },
      include: {
        transaction: {
          select: {
            id: true,
            paymentStatus: true,
            totalPrice: true,
            paymentDetail: true,
          },
        },
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order not found", 404);
    }

    // * Cek apakah order sudah dalam status yang tidak bisa dibatalkan
    if (
      order.orderStatus === "COMPLETED" ||
      order.orderStatus === "CANCELLED"
    ) {
      return createErrorResponse(
        res,
        `Order cannot be cancelled because it's already ${order.orderStatus}`,
        400
      );
    }

    const xenditInvoiceId = order.transaction.paymentDetail?.xenditInvoiceId;

    if (!xenditInvoiceId) {
      return createErrorResponse(res, `Xendit invoice id not found`, 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "CANCELLED",
          workStatus: "CANCELLED",
        },
      });

      if (order.transaction) {
        if (order.transaction.paymentStatus === "PENDING") {
          // * Jika pembayaran masih pending, cukup update status dan jadiin invoicenya expired
          if (xenditInvoiceId) {
            await xenditInvoiceClient.expireInvoice({
              invoiceId: xenditInvoiceId,
            });
          }
          await tx.transaction.update({
            where: { id: order.transaction.id },
            data: {
              paymentStatus: "FAILED",
              cancellation: {
                create: {
                  reason: reason ?? "OTHER",
                  notes,
                  cancelledById: id,
                  cancelledAt: new Date(),
                },
              },
            },
          });
        } else if (order.transaction.paymentStatus === "SUCCESS") {
          try {
            // * Lakukan refund melalui Xendit
            const refund = await xenditRefundClient.createRefund({
              data: {
                invoiceId: xenditInvoiceId,
                amount: Number(order.transaction.totalPrice),
                reason: "CANCELLATION",
                currency: "IDR",
              },
            });

            if (!refund || !refund.amount || !refund.updated) {
              throw new Error("Xendit refund failed");
            }

            await tx.transaction.update({
              where: { id: order.transaction.id },
              data: {
                paymentStatus: "REFUNDED",
                cancellation: {
                  create: {
                    reason: reason ?? "OTHER",
                    notes,
                    cancelledById: id,
                    cancelledAt: new Date(),
                  },
                },
                refund: {
                  create: {
                    amount: refund.amount,
                    reason: notes ?? "",
                    refundedById: id,
                    refundedAt: refund.updated,
                  },
                },
              },
            });
          } catch (error) {
            throw error;
          }
        }
      }

      return updatedOrder;
    });

    return createSuccessResponse(res, result, "Order berhasil dibatalkan", 200);
  } catch (error) {
    logger.error("Error cancelling order:", error);
    return createErrorResponse(res, error, 500);
  }
};

export const cancelOrderWithPaymentRequest: RequestHandler = async (
  req,
  res
) => {
  try {
    const { id } = req.user!;
    const { orderId } = req.params;
    const { reason, notes }: Partial<Cancellation> = req.body;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return createErrorResponse(res, "User not found", 404);
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        ...(user.role === "USER" && { userId: id }),
      },
      include: {
        transaction: {
          select: {
            id: true,
            paymentStatus: true,
            totalPrice: true,
            paymentDetail: true,
          },
        },
      },
    });

    if (!order) {
      return createErrorResponse(res, "Order not found", 404);
    }

    if (
      order.orderStatus === "COMPLETED" ||
      order.orderStatus === "CANCELLED"
    ) {
      return createErrorResponse(
        res,
        `Order cannot be cancelled because it's already ${order.orderStatus}`,
        400
      );
    }

    const xenditPaymentMethodId =
      order.transaction.paymentDetail?.xenditPaymentMethodId;
    const xenditPaymentRequestId =
      order.transaction.paymentDetail?.xenditPaymentRequestId;

    if (!xenditPaymentMethodId || !xenditPaymentRequestId) {
      return createErrorResponse(
        res,
        `Xendit payment method or payment request id not found`,
        404
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "CANCELLED",
          workStatus: "CANCELLED",
        },
      });

      if (order.transaction) {
        if (order.transaction.paymentStatus === "PENDING") {
          if (xenditPaymentMethodId) {
            await xenditPaymentMethodClient.expirePaymentMethod({
              paymentMethodId: xenditPaymentMethodId,
            });
          }
          await tx.transaction.update({
            where: { id: order.transaction.id },
            data: {
              paymentStatus: "FAILED",
              cancellation: {
                create: {
                  reason: reason ?? "OTHER",
                  notes,
                  cancelledById: id,
                  cancelledAt: new Date(),
                },
              },
            },
          });
        } else if (order.transaction.paymentStatus === "SUCCESS") {
          try {
            const refund = await xenditRefundClient.createRefund({
              data: {
                paymentRequestId: xenditPaymentRequestId,
                amount: Number(order.transaction.totalPrice),
                reason: "CANCELLATION",
                currency: "IDR",
              },
            });

            if (!refund || !refund.amount || !refund.updated) {
              throw new Error("Xendit refund failed");
            }

            await tx.transaction.update({
              where: { id: order.transaction.id },
              data: {
                paymentStatus: "REFUNDED",
                cancellation: {
                  create: {
                    reason: reason ?? "OTHER",
                    notes,
                    cancelledById: id,
                    cancelledAt: new Date(),
                  },
                },
                refund: {
                  create: {
                    amount: refund.amount,
                    reason: notes ?? "",
                    refundedById: id,
                    refundedAt: refund.updated,
                  },
                },
              },
            });
          } catch (error) {
            throw error;
          }
        }
      }

      return updatedOrder;
    });

    return createSuccessResponse(res, result, "Order berhasil dibatalkan", 200);
  } catch (error) {
    logger.error("Error cancelling order:", error);
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
      return createErrorResponse(res, "Order Not Found", 500);
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
      orderBy,
      orderDirection,
      orderStatus,
      workStatus,
    } = req.query as unknown as {
      page: string;
      limit: string;
      orderStatus: OrderStatus;
      workStatus: WorkStatus;
      orderBy: string;
      orderDirection: string;
    };

    const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
    const validFields = ["createdAt", "updatedAt"];
    const { field, direction } = parseOrderBy(
      orderBy,
      orderDirection,
      validFields
    );

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
      orderBy: { [field]: direction },
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

export const testFCM: RequestHandler = async (req, res) => {
  const { token } = req.body;

  try {
    const message = {
      data: {
        title: "New Notification",
        body: "Hello, this is a test notification!",
      },
      token,
    };
    await messaging().send(message);

    return createSuccessResponse(res, {});
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
