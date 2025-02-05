import {
  createBrand,
  deleteAllBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  updateBrand,
} from "@/controller/brand-controller";
import { validateBody } from "@/middlewares/validate-body";
import { createBrandSchema } from "@/validation/brand-validation";
import express from "express";

const brandRouter = express.Router();

brandRouter
  .route("/")
  .get(getBrands)
  .post(validateBody(createBrandSchema), createBrand)
  .delete(deleteAllBrand);
brandRouter
  .route("/:brandId")
  .get(getBrandById)
  .patch(validateBody(createBrandSchema), updateBrand)
  .delete(deleteBrand);

export default brandRouter;
