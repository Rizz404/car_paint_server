import {
  createUserCar,
  createManyUserCars,
  deleteAllUserCar,
  deleteUserCar,
  getUserCarById,
  getUserCars,
  searchUserCars,
  updateUserCar,
} from "@/controller/user-car-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createUserCarSchema,
  createManyUserCarSchema,
} from "@/validation/user-car-validation";
import express from "express";

const userCarRouter = express.Router();

userCarRouter
  .route("/")
  .get(getUserCars)
  .post(
    authMiddleware(),
    uploadSingle("imageUrl", "carUserCars"),
    validateBody(createUserCarSchema),
    createUserCar
  )
  .delete(authMiddleware(), deleteAllUserCar);

userCarRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyUserCarSchema),
    createManyUserCars
  );

userCarRouter.route("/search").get(searchUserCars);
userCarRouter
  .route("/:userCarId")
  .get(getUserCarById)
  .patch(authMiddleware(), validateBody(createUserCarSchema), updateUserCar)
  .delete(authMiddleware(), deleteUserCar);

export default userCarRouter;
