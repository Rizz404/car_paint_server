import { Prisma } from "@prisma/client";
import { Response, Request } from "express";
import { ZodError } from "zod";

export type RequestBody<T> = Request<{}, {}, T>;
export type RequestParams<T> = Request<T, {}, {}>;
export type RequestQuery<T> = Request<{}, T, {}>;

export type PageLimit = {
  page: number;
  limit: number;
};

export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  affectedColumns?: string[];
  target?: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: ValidationError[];
}

export interface Pagination {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface APIPaginatedResponse<T> extends ApiSuccessResponse<T> {
  pagination: Pagination;
}

const formatZodError = (error: ZodError): ValidationError[] => {
  return error.errors.map((err) => ({
    field: err.path.slice(1).map(String).join(".") || String(err.path[0]),
    message: err.message,
    code: err.code,
  }));
};

const formatValidationErrors = (
  errors: any[] | { message: string; type?: string }[]
): ValidationError[] => {
  return errors.map((err) => {
    if ("field" in err) return err as ValidationError;
    return {
      field: String(err.type || "unknown"),
      message: err.message,
    };
  });
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

const getXenditErrorField = (error: any): string => {
  const message = error.errorMessage || error.response?.message || "";

  const errorPatterns = [
    { pattern: /payment method/i, field: "payment_method" },
    { pattern: /invoice/i, field: "invoice" },
    { pattern: /disbursement/i, field: "disbursement" },
    { pattern: /virtual account/i, field: "virtual_account" },
    { pattern: /e-wallet/i, field: "ewallet" },
    { pattern: /QR/i, field: "qr_code" },
    { pattern: /card/i, field: "card" },
    { pattern: /customer/i, field: "customer" },
    { pattern: /balance/i, field: "balance" },
    { pattern: /refund/i, field: "refund" },
  ];

  for (const { pattern, field } of errorPatterns) {
    if (pattern.test(message)) {
      return field;
    }
  }

  if (error.request?.url) {
    const urlParts = error.request.url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && lastPart !== "xendit") {
      return lastPart.toLowerCase();
    }
  }

  return "xendit";
};

export const createSuccessResponse = <T extends object>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
) => {
  const apiSuccessResponse: ApiSuccessResponse<T> = {
    message,
    data,
  };
  res.status(statusCode).json(apiSuccessResponse);
};

export const createPaginatedResponse = <T extends object>(
  res: Response,
  data: T,
  currentPage: number,
  itemsPerPage: number,
  totalItems: number,
  message: string = "Success",
  statusCode = 200
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedResponse: APIPaginatedResponse<T> = {
    message,
    data,
    pagination: {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  };
  res.status(statusCode).json(paginatedResponse);
};

export const createErrorResponse = (
  res: Response,
  error: unknown,
  statusCode = 500
) => {
  let message = "An error occurred";
  let validationErrors: ValidationError[] | undefined;

  if (
    error instanceof Error &&
    "errorCode" in error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null
  ) {
    const xenditError = error as any;
    const errorCode = xenditError.errorCode || xenditError.response?.error_code;
    const errorMessage =
      xenditError.errorMessage || xenditError.response?.message;
    const field = getXenditErrorField(xenditError);

    message = `Xendit error: ${errorMessage}`;
    statusCode = xenditError.status || 400;

    validationErrors = [
      {
        field,
        message: errorMessage,
        code: errorCode,
      },
    ];
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const meta = error.meta || {};
    const modelName = (meta.modelName as string) || "";
    let field: string = "";
    let affectedColumns: string[] | undefined;

    switch (error.code) {
      case "P2000": {
        affectedColumns = meta.target ? [String(meta.target)] : [];
        field = affectedColumns[0] || "unknown_column";
        const length = meta.length ? ` (max: ${meta.length})` : "";
        message = `The provided value is too long for column "${field}"${length}`;
        statusCode = 400;
        break;
      }
      case "P2001": {
        const where = meta.where
          ? ` (filter: ${JSON.stringify(meta.where)})`
          : "";
        message = `Record in "${modelName}" not found${where}`;
        field = modelName || "unknown_model";
        statusCode = 404;
        break;
      }
      case "P2002": {
        affectedColumns = (meta.target as string[]) || [];
        field = affectedColumns.join(", ");
        message = `Unique constraint failed on field(s): ${field}`;
        statusCode = 400;
        break;
      }
      case "P2003": {
        field = meta.field_name ? String(meta.field_name) : "unknown_field";
        const foreignModel =
          field.split("_").slice(0, -2).join("_") || "related_table";
        message = `Foreign key constraint failed on field "${field}" (references "${foreignModel}")`;
        statusCode = 400;
        break;
      }
      case "P2025": {
        const details = meta.cause ? `: ${meta.cause}` : "";
        message = `Record to update or delete in "${modelName}" was not found${details}`;
        field = modelName || "unknown_record";
        statusCode = 404;
        break;
      }
      default: {
        message = `Database error (${error.code}): ${error.message}`;
        field = "database";
        statusCode = 500;
        break;
      }
    }

    validationErrors = [
      {
        field,
        message,
        code: error.code,
        affectedColumns,
        target: meta.target ? String(meta.target) : undefined,
      },
    ];
  } else if (error instanceof ZodError) {
    message = "Validation failed";
    statusCode = 400;
    validationErrors = formatZodError(error);
  } else if (Array.isArray(error)) {
    message = "Validation failed";
    statusCode = 400;
    validationErrors = formatValidationErrors(error);
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  const errorResponse: ApiErrorResponse = {
    message,
    ...(validationErrors && { errors: validationErrors }),
  };

  res.status(statusCode).json(errorResponse);
};
