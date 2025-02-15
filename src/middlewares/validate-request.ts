import { Request, Response, NextFunction, RequestHandler } from "express";
import { AnyZodObject } from "zod";
import { createErrorResponse } from "@/types/api-response";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        files: req.files,
        file: req.file,
      });
      return next();
    } catch (error) {
      return createErrorResponse(res, error, 400);
    }
  };
};

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
