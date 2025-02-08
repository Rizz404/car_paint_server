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
    uploadSingle("logo", "car-brands"),
    validateBody(createCarBrandSchema),
    createCarBrand
  )
  .delete(authMiddleware(), deleteAllCarBrand);

carBrandRouter
  .route("/multiple")
  .post(
    authMiddleware(),
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
    uploadSingle("logo", "car-brands"),
    validateBody(updateCarBrandSchema),
    updateCarBrand
  )
  .delete(authMiddleware(), deleteCarBrand);

export default carBrandRouter;
