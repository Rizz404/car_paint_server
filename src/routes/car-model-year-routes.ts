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
import { uploadSingle } from "@/playground/upload-file";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
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
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createCarModelYearSchema),
    createCarModelYear
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllCarModelYear
  );

carModelYearRouter
  .route("/car-model/:carModelId")
  .get(getCarModelYearsByCarModelId);

carModelYearRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyCarModelYearSchema),
    createManyCarModelYears
  );

carModelYearRouter.route("/search").get(searchCarModelYears);
carModelYearRouter
  .route("/:carModelYearId")
  .get(getCarModelYearById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateCarModelYearSchema),
    updateCarModelYear
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarModelYear
  );

export default carModelYearRouter;
