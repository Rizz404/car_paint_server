import { createErrorResponse } from "@/types/api-response";
import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

interface ReqUser {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: ReqUser;
    }
  }
}

export const authMiddleware = (
  authType: "required" | "optional" = "required"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { authorization: authHeader } = req.headers;

      // * Jika tidak ada header authorization
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        if (authType === "required") {
          return createErrorResponse(res, "Unauthorized", 401);
        }
        return next();
      }

      // * Decode token
      const accessToken = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_TOKEN as string
      ) as {
        userId: string;
      };

      // * Debug dengan cara yang benar

      // * Validasi hasil decode
      if (!decoded || !decoded.userId) {
        return createErrorResponse(res, "Invalid token", 403);
      }

      // * Set user ke request
      req.user = { id: decoded.userId };

      // * Lanjut ke middleware berikutnya
      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return createErrorResponse(res, "Token expired", 401);
      }
      return createErrorResponse(res, error);
    }
  };
};
