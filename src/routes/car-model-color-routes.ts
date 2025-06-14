import express from "express";
import {
  createCarModelColor,
  createManyCarModelColors,
  deleteAllCarModelColor,
  deleteCarModelColor,
  getCarModelColorById,
  getCarModelColors,
  getCarModelColorsByCarModelId,
  getCarModelColorsByColorId,
  getCarModelColorsByCarModelColorIdAndColorId,
  updateCarModelColor,
} from "@/controller/car-model-color-controller";
import { authMiddleware } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import {
  createCarModelColorSchema,
  createManyCarModelColorSchema,
  updateCarModelColorSchema,
} from "@/validation/car-model-color-validation";

const carModelColorRouter = express.Router();

// Route utama: GET semua & POST satu
carModelColorRouter
  .route("/")
  .get(getCarModelColors)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createCarModelColorSchema),
    createCarModelColor
  );

carModelColorRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyCarModelColorSchema),
    createManyCarModelColors
  );

carModelColorRouter
  .route("/all")
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllCarModelColor
  );

carModelColorRouter
  .route("/car-model/:carModelId")
  .get(getCarModelColorsByCarModelId);

carModelColorRouter.route("/color/:colorId").get(getCarModelColorsByColorId);

carModelColorRouter
  .route("/car-model/:carModelId/color/:colorId")
  .get(getCarModelColorsByCarModelColorIdAndColorId);

carModelColorRouter
  .route("/:id")
  .get(getCarModelColorById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateCarModelColorSchema),
    updateCarModelColor
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarModelColor
  );

export default carModelColorRouter;
