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
import validateRole from "@/middlewares/validate-role";
import { validateRequest } from "@/middlewares/validate-request";
import { uploadFilesToCloudinary, parseFiles } from "@/middlewares/upload-file";

const carBrandRouter = express.Router();

carBrandRouter
  .route("/")
  .get(getCarBrands)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    parseFiles.single("logo"),
    validateRequest(createCarBrandSchema),
    uploadFilesToCloudinary("car-brand"),
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
    createManyCarBrands
  );

carBrandRouter.route("/search").get(searchCarBrands);

carBrandRouter
  .route("/:carBrandId")
  .get(getCarBrandById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    parseFiles.single("logo"),
    validateRequest(updateCarBrandSchema),
    uploadFilesToCloudinary("car-brand"),
    updateCarBrand
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarBrand
  );

export default carBrandRouter;
