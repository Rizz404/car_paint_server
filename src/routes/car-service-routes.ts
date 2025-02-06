import {
  createCarService,
  createManyCarServices,
  deleteAllCarService,
  deleteCarService,
  getCarServiceById,
  getCarServices,
  searchCarServices,
  updateCarService,
} from "@/controller/car-service-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createCarServiceSchema,
  createManyCarServiceSchema,
} from "@/validation/car-service-validation";
import express from "express";

const carServiceRouter = express.Router();

carServiceRouter
  .route("/")
  .get(getCarServices)
  .post(
    authMiddleware(),
    validateBody(createCarServiceSchema),
    createCarService
  )
  .delete(authMiddleware(), deleteAllCarService);

carServiceRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyCarServiceSchema),
    createManyCarServices
  );

carServiceRouter.route("/search").get(searchCarServices);
carServiceRouter
  .route("/:carServiceId")
  .get(getCarServiceById)
  .patch(
    authMiddleware(),
    validateBody(createCarServiceSchema),
    updateCarService
  )
  .delete(authMiddleware(), deleteCarService);

export default carServiceRouter;
