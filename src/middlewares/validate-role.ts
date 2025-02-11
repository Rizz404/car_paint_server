import { createErrorResponse } from "@/types/api-response";
import { Role } from "@prisma/client";
import { RequestHandler } from "express";
import prisma from "@/configs/database";

const validateRole = (roles: Role[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      const { id } = req.user!;

      const user = await prisma.user.findUnique({
        where: { id },
        select: { role: true },
      });

      if (!user) {
        return createErrorResponse(res, "Invalid user", 403);
      }

      if (!roles.some((role) => role === user.role)) {
        return createErrorResponse(
          res,
          "You don't have permission to do this",
          403
        );
      }

      next();
    } catch (error) {
      createErrorResponse(res, error, 500);
    }
  };
};

export default validateRole;
