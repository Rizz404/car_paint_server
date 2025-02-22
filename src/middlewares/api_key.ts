import { createErrorResponse } from "@/types/api-response";
import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import env from "@/configs/environment";

const apiKeyMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const { "x-api-key": apiKeyHeader } = req.headers;
    const hashedApiKey = env.HASHED_API_KEY;

    const apiKeyMatch = await bcrypt.compare(
      apiKeyHeader as string,
      hashedApiKey
    );

    if (!apiKeyMatch) {
      return createErrorResponse(
        res,
        "Api key not match or not initialized",
        401
      );
    }

    return next();
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export default apiKeyMiddleware;
