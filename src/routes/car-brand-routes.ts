import express from "express";
import { authMiddleware } from "@/middlewares/auth";
import {
  createCarBrandSchema,
  createManyCarBrandSchema,
  updateCarBrandSchema,
} from "@/validation/car-brand-validation";
import {
  createCarBrand,
  createManyCarBrands,
  deleteAllCarBrand,
  deleteCarBrand,
  getCarBrandById,
  getCarBrands,
  searchCarBrands,
  updateCarBrand,
} from "@/controller/car-brand-controller";
import {
  validateFormWithFile,
  validateFormWithMultipleFiles,
} from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";

const carBrandRouter = express.Router();

carBrandRouter
  .route("/")
  .get(getCarBrands)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateFormWithFile(createCarBrandSchema, "logo", "car-brands"),
    createCarBrand
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllCarBrand
  );

carBrandRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateFormWithMultipleFiles(
      createManyCarBrandSchema,
      "logo",
      10,
      "car-brands"
    ),
    createManyCarBrands
  );

carBrandRouter.route("/search").get(searchCarBrands);

carBrandRouter
  .route("/:carBrandId")
  .get(getCarBrandById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateFormWithFile(updateCarBrandSchema, "logo", "car-brands"),
    updateCarBrand
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarBrand
  );

export default carBrandRouter;
