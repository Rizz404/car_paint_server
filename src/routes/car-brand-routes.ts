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
  createManyCarBrandsSchema,
} from "@/validation/car-brand-validation";
import express from "express";

const carBrandRouter = express.Router();

carBrandRouter
  .route("/")
  .get(getCarBrands)
  .post(
    authMiddleware(),
    uploadSingle("imageUrl", "carCarBrands"),
    validateBody(createCarBrandSchema),
    createCarBrand
  )
  .delete(authMiddleware(), deleteAllCarBrand);

carBrandRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyCarBrandsSchema),
    createManyCarBrands
  );

carBrandRouter.route("/search").get(searchCarBrands);
carBrandRouter
  .route("/:carCarBrandId")
  .get(getCarBrandById)
  .patch(authMiddleware(), validateBody(createCarBrandSchema), updateCarBrand)
  .delete(authMiddleware(), deleteCarBrand);

export default carBrandRouter;
