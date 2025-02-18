export interface XenditErrorResponse {
  error_code: string;
  message: string;
}

export interface XenditError extends Error {
  status: number;
  code?: string;
  response?: XenditErrorResponse;
}
