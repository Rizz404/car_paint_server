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
import { validateBody } from "@/middlewares/validate-request";
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
    validateBody(createCarServiceSchema),
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
    validateBody(createManyCarServiceSchema),
    createManyCarServices
  );

carServiceRouter.route("/search").get(searchCarServices);
carServiceRouter
  .route("/:carServiceId")
  .get(getCarServiceById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateBody(updateCarServiceSchema),
    updateCarService
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteCarService
  );

export default carServiceRouter;
