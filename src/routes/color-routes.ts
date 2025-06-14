import {
  createColor,
  createManyColors,
  deleteAllColor,
  deleteColor,
  getColorById,
  getColors,
  getColorsByModelId,
  searchColors,
  updateColor,
} from "@/controller/color-controller";
import { authMiddleware } from "@/middlewares/auth";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import {
  createColorSchema,
  createManyColorSchema,
  updateColorSchema,
} from "@/validation/color-validation";
import express from "express";

const colorRouter = express.Router();

colorRouter
  .route("/")
  .get(getColors)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createColorSchema),
    createColor
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllColor
  );

colorRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyColorSchema),
    createManyColors
  );

colorRouter.get("/car-model/:carModelId", getColorsByModelId);

colorRouter.route("/search").get(searchColors);
colorRouter
  .route("/:colorId")
  .get(getColorById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateColorSchema),
    updateColor
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteColor
  );

export default colorRouter;
