import {
  createWorkshop,
  deleteAllWorkshops,
  deleteWorkshop,
  getWorkshopById,
  getWorkshops,
  updateWorkshop,
} from "@/controller/workshop-controller";
import { validateBody } from "@/middlewares/validate-body";
import {
  createWorkshopSchema,
  updateWorkshopSchema,
} from "@/validation/workshop-validation";
import express from "express";

const workshopRouter = express.Router();

workshopRouter
  .route("/")
  .get(getWorkshops)
  .post(validateBody(createWorkshopSchema), createWorkshop)
  .delete(deleteAllWorkshops);

workshopRouter
  .route("/:workshopId")
  .get(getWorkshopById)
  .patch(validateBody(updateWorkshopSchema), updateWorkshop)
  .delete(deleteWorkshop);

export default workshopRouter;
