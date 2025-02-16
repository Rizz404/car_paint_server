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

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Extract meta information if available
    const meta = error.meta || {};
    const affectedColumns =
      "target" in meta
        ? Array.isArray(meta.target)
          ? (meta.target as string[])
          : [meta.target as string]
        : undefined;

    // Get the model name if available
    const modelName = (error.meta?.modelName as string) || "";

    // Handling known Prisma errors with specific error codes
    switch (error.code) {
      case "P2000": {
        const column = affectedColumns?.[0] || "Unknown column";
        const length = meta.length ? ` (max: ${meta.length})` : "";
        message = `The provided value is too long for column "${column}"${length}`;
        statusCode = 400;
        break;
      }
      case "P2001": {
        const where = meta.where
          ? ` (filter: ${JSON.stringify(meta.where)})`
          : "";
        message = `Record in "${modelName}" not found${where}`;
        statusCode = 404;
        break;
      }
      case "P2002": {
        const fields = affectedColumns?.join(", ") || "Unknown field";
        message = `Unique constraint failed on field(s): ${fields}`;
        statusCode = 400;
        break;
      }
      case "P2003": {
        const field = affectedColumns?.[0] || "Unknown field";
        const foreignModel = meta.field_name
          ? meta.field_name.toString().split("_").slice(0, -2).join("_")
          : "related table";
        message = `Foreign key constraint failed on field "${field}" (references "${foreignModel}")`;
        statusCode = 400;
        break;
      }
      case "P2025": {
        const details = meta.cause ? `: ${meta.cause}` : "";
        message = `Record to update or delete in "${modelName}" was not found${details}`;
        statusCode = 404;
        break;
      }
      default:
        message = `Database error (${error.code}): ${error.message}`;
        statusCode = 500;
        break;
    }

    // Create a validation error with the additional information
    validationErrors = [
      {
        field: modelName || "database",
        message,
        code: error.code,
        affectedColumns,
        target: typeof meta.target === "string" ? meta.target : undefined,
      },
    ];
  } else if (error instanceof ZodError) {
    // Handling validation errors from Zod
    message = "Validation failed";
    statusCode = 400;
    validationErrors = formatZodError(error);
  } else if (Array.isArray(error)) {
    // Handle array of validation errors
    message = "Validation failed";
    statusCode = 400;
    validationErrors = formatValidationErrors(error);
  } else if (error instanceof Error) {
    // Other errors that are instances of Error
    message = error.message;
  } else if (typeof error === "string") {
    // If error is a string, use it directly
    message = error;
  }

  const errorResponse: ApiErrorResponse = {
    message,
    ...(validationErrors && { errors: validationErrors }),
  };

  res.status(statusCode).json(errorResponse);
};
