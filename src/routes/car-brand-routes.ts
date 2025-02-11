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
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import validateRole from "@/middlewares/validate-role";
import {
  createCarBrandSchema,
  createManyCarBrandSchema,
  updateCarBrandSchema,
} from "@/validation/car-brand-validation";
import express from "express";

const carBrandRouter = express.Router();

carBrandRouter
  .route("/")
  .get(getCarBrands)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    uploadSingle("logo", "car-brands"),
    validateBody(createCarBrandSchema),
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
    uploadSingle("logo", "car-brands"),
    validateBody(createManyCarBrandSchema),
    createManyCarBrands
  );

carBrandRouter.route("/search").get(searchCarBrands);
carBrandRouter
  .route("/:carBrandId")
  .get(getCarBrandById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    uploadSingle("logo", "car-brands"),
    validateBody(updateCarBrandSchema),
    updateCarBrand
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarBrand
  );

export default carBrandRouter;
