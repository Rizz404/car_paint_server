import {
  createWorkshop,
  createManyWorkshops,
  deleteAllWorkshops,
  deleteWorkshop,
  getWorkshopById,
  getWorkshops,
  searchWorkshops,
  updateWorkshop,
  getCurrentUserNearestWorkshops,
} from "@/controller/workshop-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/playground/upload-file";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import {
  createWorkshopSchema,
  createManyWorkshopSchema,
  updateWorkshopSchema,
} from "@/validation/workshop-validation";
import express from "express";

const workshopRouter = express.Router();

workshopRouter
  .route("/")
  .get(getWorkshops)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createWorkshopSchema),
    createWorkshop
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllWorkshops
  );

workshopRouter
  .route("/nearest")
  .post(authMiddleware(), getCurrentUserNearestWorkshops);

workshopRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyWorkshopSchema),
    createManyWorkshops
  );

workshopRouter.route("/search").get(searchWorkshops);
workshopRouter
  .route("/:workshopId")
  .get(getWorkshopById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateWorkshopSchema),
    updateWorkshop
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteWorkshop
  );

export default workshopRouter;
