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
} from "@/controller/user-car-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadArray, uploadSingle } from "@/middlewares/upload-file";
import { validateBody, validateRequest } from "@/middlewares/validate-request";
import { parseFiles, uploadFilesToCloudinary } from "@/playground/upload-file";
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
    uploadArray("carImages", 5, "car-images"),
    validateRequest(createUserCarSchema),
    addUserCarImage
  );
userCarRouter
  .route("/:userCarId")
  .get(authMiddleware(), getUserCarById)
  .patch(authMiddleware(), validateBody(updateUserCarSchema), updateUserCar)
  .delete(authMiddleware(), deleteUserCar);

export default userCarRouter;
