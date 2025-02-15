import {
  createCarModel,
  createManyCarModels,
  deleteAllCarModel,
  deleteCarModel,
  getCarModelById,
  getCarModels,
  getCarModelsByBrandId,
  searchCarModels,
  updateCarModel,
} from "@/controller/car-model-controller";
import { authMiddleware } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import {
  createCarModelSchema,
  createManyCarModelSchema,
  updateCarModelSchema,
} from "@/validation/car-model-validation";
import express from "express";

const carModelRouter = express.Router();

carModelRouter
  .route("/")
  .get(getCarModels)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createCarModelSchema),
    createCarModel
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllCarModel
  );

carModelRouter.route("/car-brand/:carBrandId").get(getCarModelsByBrandId);

carModelRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyCarModelSchema),
    createManyCarModels
  );

carModelRouter.route("/search").get(searchCarModels);

carModelRouter
  .route("/:carModelId")
  .get(getCarModelById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateCarModelSchema),
    updateCarModel
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarModel
  );

export default carModelRouter;
