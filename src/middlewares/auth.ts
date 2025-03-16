import env from "@/configs/environment";
import { createErrorResponse } from "@/types/api-response";
import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, "id" | "username" | "email" | "role">;
    }
  }
}

export const authMiddleware = (
  authType: "required" | "optional" = "required"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
        env.JWT_ACCESS_TOKEN as string
      ) as Pick<User, "id" | "username" | "email" | "role">;

      // * Validasi hasil decode
      if (!decoded || !decoded.id) {
        return createErrorResponse(res, "Invalid token", 403);
      }

      // * Set user ke request
      req.user = decoded;

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
