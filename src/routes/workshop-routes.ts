import {
  createWorkshop,
  createManyWorkshops,
  deleteAllWorkshops,
  deleteWorkshop,
  getWorkshopById,
  getWorkshops,
  searchWorkshops,
  updateWorkshop,
} from "@/controller/workshop-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createWorkshopSchema,
  createManyWorkshopSchema,
} from "@/validation/workshop-validation";
import express from "express";

const workshopRouter = express.Router();

workshopRouter
  .route("/")
  .get(getWorkshops)
  .post(authMiddleware(), validateBody(createWorkshopSchema), createWorkshop)
  .delete(authMiddleware(), deleteAllWorkshops);

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
  .patch(authMiddleware(), validateBody(createWorkshopSchema), updateWorkshop)
  .delete(authMiddleware(), deleteWorkshop);

export default workshopRouter;
