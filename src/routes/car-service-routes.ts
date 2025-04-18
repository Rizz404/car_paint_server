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
import { parseFiles, uploadFilesToCloudinary } from "@/middlewares/upload-file";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import {
  createCarServiceSchema,
  createManyCarServiceSchema,
  updateCarServiceSchema,
} from "@/validation/car-service-validation";
import express from "express";

const carServiceRouter = express.Router();

carServiceRouter
  .route("/")
  .get(getCarServices)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    parseFiles.single("carServiceImage"),
    validateRequest(createCarServiceSchema),
    uploadFilesToCloudinary("car-service"),
    createCarService
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllCarService
  );

carServiceRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyCarServiceSchema),
    createManyCarServices
  );

carServiceRouter.route("/search").get(searchCarServices);
carServiceRouter
  .route("/:carServiceId")
  .get(getCarServiceById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    parseFiles.single("carServiceImage"),
    validateRequest(updateCarServiceSchema),
    uploadFilesToCloudinary("car-service"),

    updateCarService
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarService
  );

export default carServiceRouter;
