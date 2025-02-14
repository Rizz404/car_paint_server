// upload-file.ts
import { UploadApiResponse } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import cloudinary from "@/configs/cloudinary";

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        cloudinary?: UploadApiResponse;
      }
    }
  }
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
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
    if (!req.files || !Array.isArray(req.files)) return next();

    try {
      await Promise.all(
        req.files.map(async (file) => {
          file.cloudinary = await uploadToCloudinary(file.buffer, folder);
        })
      );
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const parseFiles = {
  single: (fieldName: string) => upload.single(fieldName),
  array: (fieldName: string, maxCount: number) =>
    upload.array(fieldName, maxCount),
  fields: (fields: multer.Field[]) => upload.fields(fields),
};
