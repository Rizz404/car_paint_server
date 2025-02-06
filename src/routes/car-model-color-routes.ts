import {
  createCarModelColor,
  createManyCarModelColors,
  deleteAllCarModelColor,
  deleteCarModelColor,
  getCarModelColorById,
  getCarModelColors,
  searchCarModelColors,
  updateCarModelColor,
} from "@/controller/car-model-color-controller";
import { authMiddleware } from "@/middlewares/auth";
import { validateBody } from "@/middlewares/validate-body";
import {
  createCarModelColorSchema,
  createManyCarModelColorSchema,
  updateCarModelColorSchema,
} from "@/validation/car-model-color-validation";
import express from "express";

const carModelColorRouter = express.Router();

carModelColorRouter
  .route("/")
  .get(getCarModelColors)
  .post(
    authMiddleware(),
    validateBody(createCarModelColorSchema),
    createCarModelColor
  )
  .delete(authMiddleware(), deleteAllCarModelColor);

carModelColorRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyCarModelColorSchema),
    createManyCarModelColors
  );

carModelColorRouter.route("/search").get(searchCarModelColors);
carModelColorRouter
  .route("/:carModelColorId")
  .get(getCarModelColorById)
  .patch(
    authMiddleware(),
    validateBody(updateCarModelColorSchema),
    updateCarModelColor
  )
  .delete(authMiddleware(), deleteCarModelColor);

export default carModelColorRouter;
