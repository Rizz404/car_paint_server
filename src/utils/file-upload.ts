// import { createErrorResponse } from "@/types/api-response";
// import { NextFunction, Request, Response } from "express";
// import { MulterError } from "multer";

// export const handleFileUpload = (fieldName: string, maxCount: number = 1) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const multerUpload = createMulterUpload(maxCount);
//     const upload = multerUpload.array(fieldName, maxCount);

//     upload(req, res, (err: any) => {
//       if (err) {
//         if (err instanceof MulterError) {
//           switch (err.code) {
//             case "LIMIT_FILE_SIZE":
//               return createErrorResponse(
//                 res,
//                 `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
//                 400
//               );
//             case "LIMIT_FILE_COUNT":
//             case "LIMIT_UNEXPECTED_FILE":
//               return createErrorResponse(
//                 res,
//                 `Maximum ${maxCount} files allowed`,
//                 400
//               );
//             default:
//               return createErrorResponse(res, err.message, 400);
//           }
//         }
//         return createErrorResponse(res, err.message, 400);
//       }
//       next();
//     });
//   };
// };
