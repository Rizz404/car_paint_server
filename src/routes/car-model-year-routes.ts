import {
  createCarModelYear,
  createManyCarModelYears,
  deleteAllCarModelYear,
  deleteCarModelYear,
  getCarModelYearById,
  getCarModelYears,
  getCarModelYearsByCarModelId,
  searchCarModelYears,
  updateCarModelYear,
} from "@/controller/car-model-year-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createCarModelYearSchema,
  createManyCarModelYearSchema,
  updateCarModelYearSchema,
} from "@/validation/car-model-year-validation";
import express from "express";

const carModelYearRouter = express.Router();

carModelYearRouter
  .route("/")
  .get(getCarModelYears)
  .post(
    authMiddleware(),
    validateBody(createCarModelYearSchema),
    createCarModelYear
  )
  .delete(authMiddleware(), deleteAllCarModelYear);

carModelYearRouter
  .route("/car-model/:carModelId")
  .get(getCarModelYearsByCarModelId);

carModelYearRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyCarModelYearSchema),
    createManyCarModelYears
  );

carModelYearRouter.route("/search").get(searchCarModelYears);
carModelYearRouter
  .route("/:carModelYearId")
  .get(getCarModelYearById)
  .patch(
    authMiddleware(),
    validateBody(updateCarModelYearSchema),
    updateCarModelYear
  )
  .delete(authMiddleware(), deleteCarModelYear);

export default carModelYearRouter;
