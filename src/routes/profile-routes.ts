import {
  getCompare,
  getProfileById,
  updateProfile,
} from "@/controller/profile-controller";
import { authMiddleware } from "@/middlewares/auth";
import express from "express";

const profileRouter = express.Router();

profileRouter
  .route("/")
  .get(authMiddleware(), getProfileById)
  .patch(authMiddleware(), updateProfile);

profileRouter.route("/compare").get(authMiddleware(), getCompare);

export default profileRouter;
