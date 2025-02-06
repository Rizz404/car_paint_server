import {
  createCarModel,
  createManyCarModels,
  deleteAllCarModel,
  deleteCarModel,
  getCarModelById,
  getCarModels,
  searchCarModels,
  updateCarModel,
} from "@/controller/car-model-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createCarModelSchema,
  createManyCarModelSchema,
} from "@/validation/car-model-validation";
import express from "express";

const carModelRouter = express.Router();

carModelRouter
  .route("/")
  .get(getCarModels)
  .post(
    authMiddleware(),
    uploadSingle("imageUrl", "carCarModels"),
    validateBody(createCarModelSchema),
    createCarModel
  )
  .delete(authMiddleware(), deleteAllCarModel);

carModelRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyCarModelSchema),
    createManyCarModels
  );

carModelRouter.route("/search").get(searchCarModels);
carModelRouter
  .route("/:carCarModelId")
  .get(getCarModelById)
  .patch(authMiddleware(), validateBody(createCarModelSchema), updateCarModel)
  .delete(authMiddleware(), deleteCarModel);

export default carModelRouter;
