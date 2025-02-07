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
import { validateBody } from "@/middlewares/validate-body";
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
  .post(authMiddleware(), validateBody(createCarModelSchema), createCarModel)
  .delete(authMiddleware(), deleteAllCarModel);

carModelRouter.route("/car-brand/:carBrandId").get(getCarModelsByBrandId);

carModelRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyCarModelSchema),
    createManyCarModels
  );

carModelRouter.route("/search").get(searchCarModels);
carModelRouter
  .route("/:carModelId")
  .get(getCarModelById)
  .patch(authMiddleware(), validateBody(updateCarModelSchema), updateCarModel)
  .delete(authMiddleware(), deleteCarModel);

export default carModelRouter;
