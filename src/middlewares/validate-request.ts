import { Request, Response, NextFunction, RequestHandler } from "express";
import { AnyZodObject } from "zod";
import { createErrorResponse } from "@/types/api-response";
import { uploadArray, uploadSingle } from "./upload-file";
import { MulterError } from "multer";

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

// Helper untuk memproses file data
const processFileData = (file: Express.Multer.File) => ({
  originalname: file.originalname,
  mimetype: file.mimetype,
  size: file.size,
});

// Middleware untuk single file upload dengan validasi
export const validateFormWithFile = (
  schema: AnyZodObject,
  fieldName: string,
  folder?: string
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const handleUpload = uploadSingle(fieldName, folder);

    new Promise<void>((resolve, reject) => {
      handleUpload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    })
      .then(() => {
        // Prepare data for validation
        const fileData = req.file ? processFileData(req.file) : undefined;
        const dataToValidate = {
          body: {
            ...req.body,
            ...(fileData && { [fieldName]: fileData }),
          },
        };

        // Validate
        return schema.parseAsync(dataToValidate);
      })
      .then(() => {
        next();
      })
      .catch((error) => {
        if (error instanceof MulterError) {
          createErrorResponse(res, error.message, 400);
        } else {
          createErrorResponse(res, error, 400);
        }
      });
  };
};

// Middleware untuk multiple file upload dengan validasi
export const validateFormWithMultipleFiles = (
  schema: AnyZodObject,
  fieldName: string,
  maxCount: number,
  folder?: string
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const handleUpload = uploadArray(fieldName, maxCount, folder);

    new Promise<void>((resolve, reject) => {
      handleUpload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    })
      .then(() => {
        // Prepare data for validation
        const filesData =
          req.files && Array.isArray(req.files)
            ? req.files.map(processFileData)
            : [];

        // For multiple items, we need to distribute the files to their respective items
        const bodyData = Array.isArray(req.body.items)
          ? req.body.items.map((item: any, index: number) => ({
              ...item,
              [fieldName]: filesData[index],
            }))
          : req.body;

        const dataToValidate = {
          body: Array.isArray(req.body.items) ? { items: bodyData } : bodyData,
        };

        // Validate
        return schema.parseAsync(dataToValidate);
      })
      .then(() => {
        next();
      })
      .catch((error) => {
        if (error instanceof MulterError) {
          createErrorResponse(res, error.message, 400);
        } else {
          createErrorResponse(res, error, 400);
        }
      });
  };
};
