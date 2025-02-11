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
import { validateBody } from "@/middlewares/validate-body";
import validateRole from "@/middlewares/validate-role";
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
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateBody(createCarModelYearColorSchema),
    createCarModelYearColor
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllCarModelYearColor
  );

carModelYearColorRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
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
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateBody(updateCarModelYearColorSchema),
    updateCarModelYearColor
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarModelYearColor
  );

export default carModelYearColorRouter;
