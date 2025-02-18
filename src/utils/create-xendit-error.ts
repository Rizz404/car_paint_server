import { XenditError, XenditErrorResponse } from "@/types/xendit-error";
import { Decimal } from "@prisma/client/runtime/library";

export function createXenditError(
  message: string,
  status: number,
  code?: string,
  response?: XenditErrorResponse
): XenditError {
  const error = new Error(message) as XenditError;
  error.name = "XenditError";
  error.status = status;
  error.code = code;
  error.response = response;
  return error;
}

export function validatePaymentRequestData(
  referenceId: string,
  totalAmount: Decimal,
  items: PaymentRequest[]
): void {
  // Validate reference ID
  if (!referenceId || typeof referenceId !== "string") {
    throw createXenditError(
      "Invalid reference ID",
      400,
      "INVALID_REFERENCE_ID"
    );
  }

  // Validate total amount
  if (totalAmount.lessThanOrEqualTo(0)) {
    throw createXenditError(
      "Total amount must be greater than 0",
      400,
      "INVALID_AMOUNT"
    );
  }

  // Validate items
  if (!items.length) {
    throw createXenditError(
      "Items array cannot be empty",
      400,
      "INVALID_ITEMS"
    );
  }

  // Validate each item
  items.forEach((item, index) => {
    if (!item.name) {
      throw createXenditError(
        `Item ${index} must have a name`,
        400,
        "INVALID_ITEM_NAME"
      );
    }
    if (item.price <= 0) {
      throw createXenditError(
        `Item ${index} must have a price greater than 0`,
        400,
        "INVALID_ITEM_PRICE"
      );
    }
    if (item.quantity <= 0) {
      throw createXenditError(
        `Item ${index} must have a quantity greater than 0`,
        400,
        "INVALID_ITEM_QUANTITY"
      );
    }
  });
}
