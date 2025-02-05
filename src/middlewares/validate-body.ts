import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { createErrorResponse } from "@/types/api-response";

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
      });
      return next();
    } catch (error) {
      return createErrorResponse(res, error, 400);
    }
  };
};
