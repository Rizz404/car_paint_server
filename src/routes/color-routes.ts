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
  .post(authMiddleware(), validateBody(createColorSchema), createColor)
  .delete(authMiddleware(), deleteAllColor);

colorRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyColorSchema),
    createManyColors
  );

colorRouter.route("/search").get(searchColors);
colorRouter
  .route("/:colorId")
  .get(getColorById)
  .patch(authMiddleware(), validateBody(updateColorSchema), updateColor)
  .delete(authMiddleware(), deleteColor);

export default colorRouter;
