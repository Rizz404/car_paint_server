import {
  createBrand,
  deleteAllBrand,
  deleteBrand,
  getBrandById,
  getBrands,
  searchBrands,
  updateBrand,
} from "@/controller/brand-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import { createBrandSchema } from "@/validation/brand-validation";
import express from "express";

const brandRouter = express.Router();

brandRouter
  .route("/")
  .get(getBrands)
  .post(
    authMiddleware(),
    uploadSingle("imageUrl", "brands"),
    validateBody(createBrandSchema),
    createBrand
  )
  .delete(authMiddleware(), deleteAllBrand);
brandRouter.route("/search").get(searchBrands);
brandRouter
  .route("/:brandId")
  .get(getBrandById)
  .patch(authMiddleware(), validateBody(createBrandSchema), updateBrand)
  .delete(authMiddleware(), deleteBrand);

export default brandRouter;
