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
    field: err.path.slice(1).map(String).join(".") || String(err.path[0]), // Convert all path elements to string
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

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handling known Prisma errors with specific error codes
    switch (error.code) {
      case "P2000":
        message = "The provided value is too long for the column";
        statusCode = 400;
        break;
      case "P2001":
        message = "The requested record was not found";
        statusCode = 404;
        break;
      case "P2002":
        message = "Unique constraint failed";
        statusCode = 400;
        break;
      case "P2003":
        message = "Foreign key constraint failed";
        statusCode = 400;
        break;
      case "P2025":
        message = "The record to update or delete was not found";
        statusCode = 404;
        break;
      default:
        message = "A database error occurred";
        statusCode = 500;
        break;
    }
  } else if (error instanceof ZodError) {
    // Handling validation errors from Zod
    message = "Validation failed";
    statusCode = 400;
  } else if (error instanceof Error) {
    // Other errors that are instances of Error
    message = error.message;
  } else if (typeof error === "string") {
    // If error is a string, use it directly
    message = error;
  }

  const errorResponse: ApiErrorResponse = { message };
  res.status(statusCode).json(errorResponse);
};
