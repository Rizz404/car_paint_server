import {
  createUserCar,
  createManyUserCars,
  deleteAllUserCar,
  deleteUserCar,
  getUserCarById,
  getUserCars,
  searchUserCars,
  updateUserCar,
  addUserCarImage,
  deleteUserCarImage,
  addUserCarImageWithImagekit,
  createUserCarWithImagekit,
} from "@/controller/user-car-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadArray, uploadSingle } from "@/middlewares/upload-file";
import { validateBody, validateRequest } from "@/middlewares/validate-request";
import {
  parseFiles,
  uploadFilesToCloudinary,
} from "@/playground/upload-file-cloudinary";
import { uploadFilesToImageKit } from "@/playground/upload-file-imagekit";
import {
  createUserCarSchema,
  createManyUserCarSchema,
  updateUserCarSchema,
} from "@/validation/user-car-validation";
import express from "express";

const userCarRouter = express.Router();

userCarRouter
  .route("/")
  .get(authMiddleware(), getUserCars)
  .post(
    authMiddleware(),
    parseFiles.array("carImages", 5),
    validateRequest(createUserCarSchema),
    uploadFilesToCloudinary("car-images"),
    createUserCar
  )
  .delete(authMiddleware(), deleteAllUserCar);

userCarRouter
  .route("/imagekit")
  .post(
    authMiddleware(),
    parseFiles.array("carImages", 5),
    validateRequest(createUserCarSchema),
    uploadFilesToImageKit("car-images"),
    createUserCarWithImagekit
  );

userCarRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRequest(createManyUserCarSchema),
    createManyUserCars
  );

userCarRouter.route("/search").get(authMiddleware(), searchUserCars);

userCarRouter
  .route("/car-images/:userCarId/index/:index")
  .delete(authMiddleware(), deleteUserCarImage);

userCarRouter
  .route("/car-images/:userCarId")
  .post(
    authMiddleware(),
    parseFiles.array("carImages", 5),
    validateRequest(createUserCarSchema),
    uploadFilesToCloudinary("car-images"),
    addUserCarImage
  );

userCarRouter
  .route("/car-images/imagekit/:userCarId")
  .post(
    authMiddleware(),
    parseFiles.array("carImages", 5),
    validateRequest(createUserCarSchema),
    uploadFilesToImageKit("car-images"),
    addUserCarImageWithImagekit
  );

userCarRouter
  .route("/:userCarId")
  .get(authMiddleware(), getUserCarById)
  .patch(authMiddleware(), validateBody(updateUserCarSchema), updateUserCar)
  .delete(authMiddleware(), deleteUserCar);

export default userCarRouter;
