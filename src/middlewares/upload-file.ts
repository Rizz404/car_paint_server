import { UploadApiResponse } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer"; // Import MulterError

import cloudinary from "@/configs/cloudinary";

// * Deklarasi tipe untuk Cloudinary response
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        cloudinary?: UploadApiResponse;
      }
    }
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// * Fungsi Upload ke Cloudinary
const uploadToCloudinary = async (
  buffer: Buffer,
  folder = "default_folder",
  filename?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        transformation: [
          {
            width: 800,
            height: 800,
            crop: "limit",
          },
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error); // Logging error Cloudinary
          return reject(error);
        }
        if (result) {
          return resolve(result);
        } // Ini untuk jaga-jaga jika tidak ada error dan tidak ada result (seharusnya tidak terjadi)
        reject(new Error("No result or error from Cloudinary upload"));
      }
    );
    uploadStream.end(buffer);
  });
};

// * Middleware untuk Single File (Opsional)
const uploadSingle =
  (fieldName: string, folder?: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const singleUpload = upload.single(fieldName);
    singleUpload(req, res, async (err) => {
      if (err instanceof MulterError) {
        // Menggunakan MulterError import
        console.error("Multer Error (Single):", err);
        return res.status(400).json({ error: err.message });
      } else if (err) {
        console.error("Unknown Error (Single):", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      try {
        // Jika ada file, upload ke Cloudinary
        if (req.file) {
          const result = await uploadToCloudinary(
            req.file.buffer,
            folder,
            req.file.originalname.split(".")[0]
          );
          req.file.cloudinary = result;
        }
        next();
      } catch (error: any) {
        console.error("Error in uploadSingle middleware:", error); // Logging error middleware
        return res.status(500).json({ error: error.message });
      }
    });
  };

// * Middleware untuk Multiple Files (Opsional)
const uploadArray =
  (fieldName: string, maxCount: number, folder?: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const arrayUpload = upload.array(fieldName, maxCount);
    arrayUpload(req, res, async (err) => {
      if (err instanceof MulterError) {
        // Menggunakan MulterError import
        console.error("Multer Error (Array):", err);
        return res.status(400).json({ error: err.message });
      } else if (err) {
        console.error("Unknown Error (Array):", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      try {
        // Jika ada files, upload ke Cloudinary
        if (req.files && req.files instanceof Array && req.files.length > 0) {
          const results = await Promise.all(
            req.files.map(async (file) => {
              // Tambahkan async disini
              try {
                return await uploadToCloudinary(
                  // Tambahkan return disini
                  file.buffer,
                  folder,
                  file.originalname.split(".")[0]
                );
              } catch (error: any) {
                console.error(
                  "Error during uploadToCloudinary (Array):",
                  error
                ); // Logging error di dalam Promise.all
                throw error; // Re-throw error agar Promise.all reject jika salah satu upload gagal
              }
            })
          );
          req.files.forEach((file, index) => {
            file.cloudinary = results[index];
          });
        }
        next();
      } catch (error: any) {
        console.error("Error in uploadArray middleware:", error); // Logging error middleware
        return res.status(500).json({ error: error.message });
      }
    });
  };

// * Middleware untuk Upload Fields (Opsional)
const uploadFields =
  (fields: { name: string; maxCount?: number }[], folder?: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const fieldsUpload = upload.fields(fields);
    fieldsUpload(req, res, async (err) => {
      if (err instanceof MulterError) {
        // Menggunakan MulterError import
        console.error("Multer Error (Fields):", err);
        return res.status(400).json({ error: err.message });
      } else if (err) {
        console.error("Unknown Error (Fields):", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      try {
        if (req.files && typeof req.files === "object") {
          // Proses setiap field satu per satu
          for (const [fieldName, files] of Object.entries(req.files)) {
            if (Array.isArray(files) && files.length > 0) {
              // Upload semua file dalam field ini ke Cloudinary
              const results = await Promise.all(
                files.map(async (file) => {
                  // Tambahkan async disini
                  try {
                    return await uploadToCloudinary(
                      // Tambahkan return disini
                      file.buffer,
                      folder,
                      file.originalname.split(".")[0]
                    );
                  } catch (error: any) {
                    console.error(
                      `Error during uploadToCloudinary (Fields - ${fieldName}):`,
                      error
                    ); // Logging error di dalam Promise.all dengan fieldName
                    throw error; // Re-throw error agar Promise.all reject jika salah satu upload gagal
                  }
                })
              ); // Assign hasil cloudinary ke masing-masing file

              files.forEach((file, index) => {
                file.cloudinary = results[index];
              });
            }
          }
        }
        next();
      } catch (error: any) {
        console.error("Error in uploadFields middleware:", error); // Logging error middleware
        return res.status(500).json({ error: error.message });
      }
    });
  };

export { uploadArray, uploadFields, uploadSingle };
