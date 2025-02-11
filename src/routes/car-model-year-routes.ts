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
    validateBody(createCarModelYearSchema),
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
    validateBody(createManyCarModelYearSchema),
    createManyCarModelYears
  );

carModelYearRouter.route("/search").get(searchCarModelYears);
carModelYearRouter
  .route("/:carModelYearId")
  .get(getCarModelYearById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateBody(updateCarModelYearSchema),
    updateCarModelYear
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarModelYear
  );

export default carModelYearRouter;
