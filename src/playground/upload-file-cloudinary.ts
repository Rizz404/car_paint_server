import { UploadApiResponse } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import cloudinary from "@/configs/cloudinary";
import { createErrorResponse } from "@/types/api-response";

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        cloudinary?: UploadApiResponse;
      }
    }
  }
}

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const createMulterUpload = (maxCount: number) => {
  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: maxCount, // Add explicit files limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype) {
        cb(new Error("No mime type detected"));
        return;
      }

      if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
          )
        );
      }
    },
  });
};

const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const uploadFilesToCloudinary = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];
    if (!files || !Array.isArray(files) || files.length === 0) {
      return next();
    }

    try {
      await Promise.all(
        files.map(async (file) => {
          file.cloudinary = await uploadToCloudinary(file.buffer, folder);
        })
      );
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const handleFileUpload = (fieldName: string, maxCount: number = 1) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Create a new multer instance with the specific maxCount
    const multerUpload = createMulterUpload(maxCount);
    const upload = multerUpload.array(fieldName, maxCount);

    upload(req, res, (err: any) => {
      if (err) {
        if (err instanceof MulterError) {
          switch (err.code) {
            case "LIMIT_FILE_SIZE":
              return createErrorResponse(
                res,
                `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                400
              );
            case "LIMIT_FILE_COUNT":
            case "LIMIT_UNEXPECTED_FILE":
              return createErrorResponse(
                res,
                `Maximum ${maxCount} files allowed`,
                400
              );
            default:
              return createErrorResponse(res, err.message, 400);
          }
        }
        return createErrorResponse(res, err.message, 400);
      }
      next();
    });
  };
};

export const parseFiles = {
  single: (fieldName: string) => handleFileUpload(fieldName, 1),
  array: (fieldName: string, maxCount: number) =>
    handleFileUpload(fieldName, maxCount),
};
