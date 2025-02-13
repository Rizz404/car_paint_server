import {
  getHistoryById,
  getHistories,
  getCurrentUserHistories,
} from "@/controller/history-controller";
import { authMiddleware } from "@/middlewares/auth";
import validateRole from "@/middlewares/validate-role";
import express from "express";

const historyRouter = express.Router();

historyRouter
  .route("/")
  .get(authMiddleware(), validateRole(["ADMIN", "SUPER_ADMIN"]), getHistories);

historyRouter.route("/user").get(authMiddleware(), getCurrentUserHistories);

historyRouter.route("/:historyId").get(getHistoryById);

export default historyRouter;
