import {
  createCarModelYearColor,
  createManyCarModelYearColors,
  deleteAllCarModelYearColor,
  deleteCarModelYearColor,
  getCarModelYearColorById,
  getCarModelYearColors,
  getCarModelYearColorsByCarModelYearId,
  getCarModelYearColorsByCarModelYearIdAndColorId,
  getCarModelYearColorsByColorId,
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

carModelYearColorRouter.get(
  "/car-model-year/:carModelYearId",
  getCarModelYearColorsByCarModelYearId
);
carModelYearColorRouter.get("/color/:colorId", getCarModelYearColorsByColorId);
carModelYearColorRouter.get(
  "/car-model-year/:carModelYearId/color/:colorId",
  getCarModelYearColorsByCarModelYearIdAndColorId
);

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
