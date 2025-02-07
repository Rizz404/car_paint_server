import {
  createCarModelYearColor,
  createManyCarModelYearColors,
  deleteAllCarModelYearColor,
  deleteCarModelYearColor,
  getCarModelYearColorById,
  getCarModelYearColors,
  searchCarModelYearColors,
  updateCarModelYearColor,
} from "@/controller/car-model-year-color-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createCarModelYearColorSchema,
  createManyCarModelYearColorSchema,
  updateCarModelYearColorSchema,
} from "@/validation/car-model-year-color-validation";
import express from "express";

const carModelYearColorRouter = express.Router();

carModelYearColorRouter
  .route("/")
  .get(getCarModelYearColors)
  .post(
    authMiddleware(),
    validateBody(createCarModelYearColorSchema),
    createCarModelYearColor
  )
  .delete(authMiddleware(), deleteAllCarModelYearColor);

carModelYearColorRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyCarModelYearColorSchema),
    createManyCarModelYearColors
  );

carModelYearColorRouter.route("/search").get(searchCarModelYearColors);
carModelYearColorRouter
  .route("/:carModelYearColorId")
  .get(getCarModelYearColorById)
  .patch(
    authMiddleware(),
    validateBody(updateCarModelYearColorSchema),
    updateCarModelYearColor
  )
  .delete(authMiddleware(), deleteCarModelYearColor);

export default carModelYearColorRouter;
