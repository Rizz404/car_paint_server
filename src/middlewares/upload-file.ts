import { UploadApiResponse } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import cloudinary from "@/configs/cloudinary";
import { createErrorResponse } from "@/types/api-response";
import { imagekit } from "@/configs/imagekit";

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        cloudinary?: UploadApiResponse;
        imagekit?: {
          url: string;
          fileId: string;
          width: number;
          height: number;
          size: number;
          fileType: string;
        };
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
  "image/pjpeg", // Progressive JPEG
  "image/x-png", // Older PNG format
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const createMulterConfig = () => {
  return {
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
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
  };
};

const multerUpload = multer(createMulterConfig());

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
    // Handle both single file and multiple files
    const files = (req.files as Express.Multer.File[]) || [
      req.file as Express.Multer.File,
    ];

    if (!files || files.length === 0 || !files[0]) {
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

const uploadToImageKit = async (
  buffer: Buffer,
  folder: string
): Promise<any> => {
  try {
    const result = await imagekit.upload({
      file: buffer.toString("base64"),
      fileName: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      folder,
      useUniqueFileName: false,
    });

    return {
      url: result.url,
      fileId: result.fileId,
      width: result.width,
      height: result.height,
      size: result.size,
      fileType: result.fileType,
    };
  } catch (error) {
    throw new Error("Image upload failed");
  }
};

export const uploadFilesToImageKit = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];
    if (!files || !Array.isArray(files) || files.length === 0) {
      return next();
    }

    try {
      await Promise.all(
        files.map(async (file) => {
          file.imagekit = await uploadToImageKit(file.buffer, folder);
        })
      );
      next();
    } catch (error) {
      next(error);
    }
  };
};

const handleMulterError = (err: any, res: Response, maxCount?: number) => {
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
          `Maximum ${maxCount} file${maxCount === 1 ? "" : "s"} allowed`,
          400
        );
      default:
        return createErrorResponse(res, err.message, 400);
    }
  }
  return createErrorResponse(res, err.message, 400);
};

export const handleSingleFileUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = multerUpload.single(fieldName);

    upload(req, res, (err: any) => {
      if (err) {
        return handleMulterError(err, res, 1);
      }
      next();
    });
  };
};

export const handleMultipleFileUpload = (
  fieldName: string,
  maxCount: number
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = multerUpload.array(fieldName, maxCount);

    upload(req, res, (err: any) => {
      if (err) {
        return handleMulterError(err, res, maxCount);
      }
      next();
    });
  };
};

export const parseFiles = {
  single: (fieldName: string) => handleSingleFileUpload(fieldName),
  array: (fieldName: string, maxCount: number) =>
    handleMultipleFileUpload(fieldName, maxCount),
};
