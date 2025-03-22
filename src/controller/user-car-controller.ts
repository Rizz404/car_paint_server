// import prisma from "@/configs/database";
// import {
//   createErrorResponse,
//   createPaginatedResponse,
//   createSuccessResponse,
// } from "@/types/api-response";
// import {
//   deleteCloudinaryImage,
//   deleteCloudinaryImages,
//   isCloudinaryUrl,
// } from "@/utils/cloudinary";
// import logger from "@/utils/logger";
// import { parseOrderBy, parsePagination } from "@/utils/query";
// import { UserCar } from "@prisma/client";
// import { RequestHandler } from "express";

// // * *======================= POST =======================*
// export const createManyUserCars: RequestHandler = async (req, res) => {
//   try {
//     const payloads: UserCar[] = req.body;

//     const userCarsToCreate = payloads.map((payload, index) => ({
//       ...payload,
//     }));

//     const createdUserCars = await prisma.userCar.createMany({
//       data: userCarsToCreate,
//       skipDuplicates: true,
//     });

//     return createSuccessResponse(
//       res,
//       createdUserCars,
//       "User Cars Created",
//       201
//     );
//   } catch (error) {
//     logger.error("Error creating multiple userCars:", error);
//     return createErrorResponse(res, error, 500);
//   }
// };

// export const createUserCar: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const {
//       carModelYearColorId,
//       colorId,
//       carModelYearId,
//       ...rest
//     }: UserCar & { carModelYearId: string; colorId: string } = req.body;
//     const carImages = req.files as Express.Multer.File[];

//     const userCars = await prisma.userCar.findMany({ where: { userId: id } });

//     if (userCars.length >= 1) {
//       return createErrorResponse(res, "Max only one car", 400);
//     }

//     let finalCarModelYearColorId: string;

//     if (carModelYearColorId) {
//       const existingCarModelYearColor =
//         await prisma.carModelYearColor.findUnique({
//           where: { id: carModelYearColorId },
//         });

//       if (!existingCarModelYearColor) {
//         return createErrorResponse(
//           res,
//           { message: "Invalid carModelYearColorId" },
//           400
//         );
//       }

//       finalCarModelYearColorId = carModelYearColorId;
//     } else if (carModelYearId && colorId) {
//       const [carModelYear, color] = await Promise.all([
//         prisma.carModelYear.findUnique({
//           where: { id: carModelYearId },
//         }),
//         prisma.color.findUnique({
//           where: { id: colorId },
//         }),
//       ]);

//       if (!carModelYear) {
//         return createErrorResponse(
//           res,
//           { message: "Invalid carModelYearId" },
//           400
//         );
//       }

//       if (!color) {
//         return createErrorResponse(res, { message: "Invalid colorId" }, 400);
//       }

//       const carModelYearColor = await prisma.carModelYearColor.upsert({
//         where: {
//           carModelYearId_colorId: {
//             carModelYearId,
//             colorId,
//           },
//         },
//         create: {
//           carModelYearId,
//           colorId,
//         },
//         update: {},
//       });

//       finalCarModelYearColorId = carModelYearColor.id;
//     } else {
//       return createErrorResponse(
//         res,
//         {
//           message:
//             "Either carModelYearColorId or both colorId and carModelYearId are required",
//         },
//         400
//       );
//     }

//     const carImageUrls =
//       carImages
//         ?.map((carImage) => carImage.cloudinary?.secure_url)
//         .filter((url): url is string => typeof url === "string") || [];

//     const createdUserCar = await prisma.userCar.create({
//       data: {
//         ...rest,
//         userId: id,
//         carModelYearColorId: finalCarModelYearColorId,
//         carImages: carImageUrls,
//       },
//     });

//     return createSuccessResponse(res, createdUserCar, "Created", 201);
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// export const createUserCarWithImagekit: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const payload: UserCar = req.body;
//     const carImages = req.files as Express.Multer.File[];

//     const carImageUrls =
//       carImages
//         ?.map((carImage) => carImage.imagekit?.url)
//         .filter((url): url is string => typeof url === "string") || [];

//     const createdUserCar = await prisma.userCar.create({
//       data: {
//         ...payload,
//         userId: id,
//         carImages: carImageUrls,
//       },
//     });

//     return createSuccessResponse(res, createdUserCar, "Created", 201);
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// // * *======================= GET =======================*
// export const getUserCars: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const {
//       page = "1",
//       limit = "10",
//       orderBy,
//       orderDirection,
//     } = req.query as unknown as {
//       page: string;
//       limit: string;
//       orderBy?: string;
//       orderDirection?: string;
//     };

//     const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);
//     const validFields = ["licensePlate", "createdAt", "updatedAt"];
//     const { field, direction } = parseOrderBy(
//       orderBy,
//       orderDirection,
//       validFields
//     );

//     const userCars = await prisma.userCar.findMany({
//       where: { userId: id },
//       include: {
//         carModelYearColor: {
//           select: {
//             carModelYear: {
//               select: {
//                 id: true,
//                 year: true,
//                 carModel: {
//                   select: {
//                     id: true,
//                     name: true,
//                     carBrand: { select: { id: true, name: true } },
//                   },
//                 },
//               },
//             },
//             color: { select: { id: true, name: true } },
//           },
//         },
//         user: {
//           select: { id: true, username: true, email: true, profileImage: true },
//         },
//       },
//       skip: offset,
//       take: +limit,
//       orderBy: { [field]: direction },
//     });
//     const totalUserCars = await prisma.userCar.count({ where: { userId: id } });

//     createPaginatedResponse(
//       res,
//       userCars,
//       currentPage,
//       itemsPerPage,
//       totalUserCars
//     );
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// export const getUserCarById: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const { userCarId } = req.params;

//     const userCar = await prisma.userCar.findUnique({
//       where: { id: userCarId, userId: id },
//       include: {
//         carModelYearColor: {
//           select: {
//             carModelYear: {
//               select: {
//                 id: true,
//                 year: true,
//                 carModel: {
//                   select: {
//                     id: true,
//                     name: true,
//                     carBrand: { select: { id: true, name: true } },
//                   },
//                 },
//               },
//             },
//             color: { select: { id: true, name: true } },
//           },
//         },
//         user: {
//           select: { id: true, username: true, email: true, profileImage: true },
//         },
//       },
//     });

//     if (!userCar) {
//       return createErrorResponse(res, "User Car not found", 404);
//     }

//     return createSuccessResponse(res, userCar);
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// export const searchUserCars: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const {
//       page = "1",
//       limit = "10",
//       licensePlate,
//     } = req.query as unknown as {
//       page: string;
//       limit: string;
//       licensePlate: string;
//     };

//     const { currentPage, itemsPerPage, offset } = parsePagination(page, limit);

//     const userCars = await prisma.userCar.findMany({
//       where: {
//         userId: id,
//         licensePlate: { mode: "insensitive", contains: licensePlate },
//       },
//       include: {
//         carModelYearColor: {
//           select: {
//             carModelYear: {
//               select: {
//                 id: true,
//                 year: true,
//                 carModel: {
//                   select: {
//                     id: true,
//                     name: true,
//                     carBrand: { select: { id: true, name: true } },
//                   },
//                 },
//               },
//             },
//             color: { select: { id: true, name: true } },
//           },
//         },
//         user: {
//           select: { id: true, username: true, email: true, profileImage: true },
//         },
//       },
//       skip: offset,
//       take: +limit,
//     });
//     const totalUserCars = await prisma.userCar.count({
//       where: {
//         userId: id,
//         licensePlate: { mode: "insensitive", contains: licensePlate },
//       },
//     });

//     createPaginatedResponse(
//       res,
//       userCars,
//       currentPage,
//       itemsPerPage,
//       totalUserCars
//     );
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// // * *======================= PATCH =======================*
// export const updateUserCar: RequestHandler = async (req, res) => {
//   try {
//     const { id: userId } = req.user!;
//     const { userCarId } = req.params;
//     let {
//       deleteImages = [],
//       carModelYearColorId,
//       colorId,
//       carModelYearId,
//       ...rest
//     }: Partial<UserCar> & {
//       deleteImages?: string[] | string;
//       colorId?: string;
//       carModelYearId?: string;
//     } = req.body;

//     const carImages = req.files as Express.Multer.File[];

//     // * Validasi dan proses deleteImages
//     if (typeof deleteImages === "string") {
//       try {
//         deleteImages = JSON.parse(deleteImages) as string[];
//       } catch (error) {
//         return createErrorResponse(
//           res,
//           "Invalid JSON format for deleteImages",
//           400
//         );
//       }
//     }

//     if (!Array.isArray(deleteImages)) {
//       deleteImages = [];
//     }

//     // * Cari UserCar yang akan diupdate
//     const userCar = await prisma.userCar.findUnique({
//       where: { id: userCarId, userId },
//       include: { carModelYearColor: true },
//     });

//     if (!userCar) {
//       return createErrorResponse(res, "User Car Not Found", 404);
//     }

//     let finalCarModelYearColorId = userCar.carModelYearColorId;

//     // * Proses validasi relasi jika ada perubahan
//     if (carModelYearColorId || colorId || carModelYearId) {
//       if (carModelYearColorId) {
//         const existing = await prisma.carModelYearColor.findUnique({
//           where: { id: carModelYearColorId },
//         });
//         if (!existing)
//           return createErrorResponse(res, "Invalid carModelYearColorId", 400);
//         finalCarModelYearColorId = carModelYearColorId;
//       } else if (colorId && carModelYearId) {
//         const [color, carModelYear] = await Promise.all([
//           prisma.color.findUnique({ where: { id: colorId } }),
//           prisma.carModelYear.findUnique({ where: { id: carModelYearId } }),
//         ]);

//         if (!color || !carModelYear) {
//           return createErrorResponse(
//             res,
//             "Invalid colorId or carModelYearId",
//             400
//           );
//         }

//         const relation = await prisma.carModelYearColor.upsert({
//           where: { carModelYearId_colorId: { carModelYearId, colorId } },
//           create: { carModelYearId, colorId },
//           update: {},
//         });

//         finalCarModelYearColorId = relation.id;
//       } else {
//         return createErrorResponse(
//           res,
//           "Need either carModelYearColorId or both colorId and carModelYearId",
//           400
//         );
//       }
//     }

//     // * Proses gambar
//     const addImages =
//       carImages
//         ?.map((img) => img.cloudinary?.secure_url)
//         .filter((url): url is string => !!url) || [];

//     let updatedImages = [...userCar.carImages];

//     // * Hapus gambar yang dipilih
//     if (deleteImages.length > 0) {
//       updatedImages = updatedImages.filter(
//         (img) => !deleteImages.includes(img)
//       );
//       await deleteCloudinaryImages(deleteImages);
//     }

//     // * Tambahkan gambar baru
//     if (addImages.length > 0) {
//       updatedImages = [...updatedImages, ...addImages];
//     }

//     // * Update data
//     const updatedUserCar = await prisma.userCar.update({
//       where: { id: userCarId },
//       data: {
//         ...rest,
//         carModelYearColorId: finalCarModelYearColorId,
//         carImages: updatedImages,
//       },
//     });

//     return createSuccessResponse(res, updatedUserCar, "Updated");
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };
// // * *======================= DELETE =======================*
// export const deleteUserCar: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const { userCarId } = req.params;

//     const userCar = await prisma.userCar.findUnique({
//       where: {
//         id: userCarId,
//         userId: id,
//       },
//     });

//     if (!userCar) {
//       return createErrorResponse(res, "User Car Not Found", 404);
//     }

//     if (userCar.carImages && userCar.carImages.length > 0) {
//       await deleteCloudinaryImages(userCar.carImages);
//     }

//     const deletedUserCar = await prisma.userCar.delete({
//       where: { id: userCarId },
//     });

//     return createSuccessResponse(res, deletedUserCar, "Deleted");
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// export const deleteAllUserCar: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;

//     // * Get all user cars first to delete their images
//     const userCars = await prisma.userCar.findMany({
//       where: { userId: id },
//       select: { carImages: true },
//     });

//     // * Collect all image URLs and delete them from Cloudinary
//     const allImages = userCars
//       .flatMap((car) => car.carImages || [])
//       .filter((url) => url); // * Remove null/undefined

//     if (allImages.length > 0) {
//       await deleteCloudinaryImages(allImages);
//     }

//     const deletedAllUserCars = await prisma.userCar.deleteMany({
//       where: { userId: id },
//     });

//     return createSuccessResponse(res, deletedAllUserCars, "All cars deleted");
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// // * *======================= ADD & DELETE CAR IMAGES =======================*
// export const addUserCarImage: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const { userCarId } = req.params;
//     const carImages = req.files as Express.Multer.File[];

//     const carImageUrls =
//       carImages
//         ?.map((carImage) => carImage.cloudinary?.secure_url)
//         .filter((url): url is string => typeof url === "string") || [];

//     const userCar = await prisma.userCar.findUnique({
//       where: {
//         id: userCarId,
//         userId: id,
//       },
//     });

//     if (!userCar) {
//       return createErrorResponse(res, "User Car Not Found", 404);
//     }

//     const existingCarImages = userCar.carImages || [];

//     const updatedCarImages = [...existingCarImages, ...carImageUrls];

//     const updatedUserCar = await prisma.userCar.update({
//       where: { id: userCarId },
//       data: {
//         carImages: updatedCarImages,
//       },
//     });

//     return createSuccessResponse(res, updatedUserCar, "Car Image Added");
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// export const addUserCarImageWithImagekit: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const { userCarId } = req.params;
//     const carImages = req.files as Express.Multer.File[];

//     const carImageUrls =
//       carImages
//         ?.map((carImage) => carImage.imagekit?.url)
//         .filter((url): url is string => typeof url === "string") || [];

//     const userCar = await prisma.userCar.findUnique({
//       where: {
//         id: userCarId,
//         userId: id,
//       },
//     });

//     if (!userCar) {
//       return createErrorResponse(res, "User Car Not Found", 404);
//     }

//     const existingCarImages = userCar.carImages || [];

//     const updatedCarImages = [...existingCarImages, ...carImageUrls];

//     const updatedUserCar = await prisma.userCar.update({
//       where: { id: userCarId },
//       data: {
//         carImages: updatedCarImages,
//       },
//     });

//     return createSuccessResponse(res, updatedUserCar, "Car Image Added");
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };

// export const deleteUserCarImage: RequestHandler = async (req, res) => {
//   try {
//     const { id } = req.user!;
//     const { userCarId, index } = req.params;

//     if (index === undefined) {
//       return createErrorResponse(res, "Image index is required", 400);
//     }

//     const imageIndex = parseInt(index as string, 10);

//     if (isNaN(imageIndex) || imageIndex < 0) {
//       return createErrorResponse(res, "Invalid image index", 400);
//     }

//     const userCar = await prisma.userCar.findUnique({
//       where: {
//         id: userCarId,
//         userId: id,
//       },
//     });

//     if (!userCar) {
//       return createErrorResponse(res, "User Car Not Found", 404);
//     }

//     if (!userCar.carImages || imageIndex >= userCar.carImages.length) {
//       return createErrorResponse(
//         res,
//         "Image index out of bounds or no images available",
//         400
//       );
//     }

//     // * Get the image URL that will be deleted
//     const imageToDelete = userCar.carImages[imageIndex];

//     // * Delete from Cloudinary if it's a Cloudinary URL
//     if (isCloudinaryUrl(imageToDelete)) {
//       await deleteCloudinaryImage(imageToDelete);
//     }

//     const updatedCarImages = userCar.carImages.filter(
//       (_, i) => i !== imageIndex
//     );

//     const updatedUserCar = await prisma.userCar.update({
//       where: { id: userCarId },
//       data: {
//         carImages: updatedCarImages,
//       },
//     });

//     return createSuccessResponse(res, updatedUserCar, "Car Image Deleted");
//   } catch (error) {
//     return createErrorResponse(res, error, 500);
//   }
// };
