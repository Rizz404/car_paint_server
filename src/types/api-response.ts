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
  statusCode = 500,
  validationErrors?: any[] | { message: string; type?: string }[]
) => {
  const errorResponse: ApiErrorResponse = {
    message: getErrorMessage(error),
  };

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    errorResponse.message = "Validation failed";
    errorResponse.errors = formatZodError(error);
    statusCode = 400;
  }
  // Handle other validation errors
  else if (validationErrors) {
    errorResponse.errors = formatValidationErrors(validationErrors);
  }

  res.status(statusCode).json(errorResponse);
};
