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
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
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
  .post(authMiddleware(), validateBody(createWorkshopSchema), createWorkshop)
  .delete(authMiddleware(), deleteAllWorkshops);

workshopRouter
  .route("/nearest")
  .get(authMiddleware(), getCurrentUserNearestWorkshops);

workshopRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyWorkshopSchema),
    createManyWorkshops
  );

workshopRouter.route("/search").get(searchWorkshops);
workshopRouter
  .route("/:workshopId")
  .get(getWorkshopById)
  .patch(authMiddleware(), validateBody(updateWorkshopSchema), updateWorkshop)
  .delete(authMiddleware(), deleteWorkshop);

export default workshopRouter;
