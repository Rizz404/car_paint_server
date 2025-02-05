import {
  createBrand,
  deleteBrand,
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
  .post(validateBody(createBrandSchema), createBrand);
brandRouter
  .route("/:brandId")
  .patch(validateBody(createBrandSchema), updateBrand)
  .delete(deleteBrand);

export default brandRouter;
