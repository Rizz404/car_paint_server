import {
  createColor,
  createManyColors,
  deleteAllColor,
  deleteColor,
  getColorById,
  getColors,
  searchColors,
  updateColor,
} from "@/controller/color-controller";
import { authMiddleware } from "@/middlewares/auth";
import { validateBody } from "@/middlewares/validate-body";
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
    validateBody(createColorSchema),
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
    validateBody(createManyColorSchema),
    createManyColors
  );

colorRouter.route("/search").get(searchColors);
colorRouter
  .route("/:colorId")
  .get(getColorById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateBody(updateColorSchema),
    updateColor
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteColor
  );

export default colorRouter;
