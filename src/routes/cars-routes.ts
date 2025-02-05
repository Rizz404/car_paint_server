import { createCar } from "@/controller/cars-controller";
import {
  getCompare,
  getProfileById,
  updateProfile,
} from "@/controller/profile-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadArray } from "@/middlewares/upload-file";
import express from "express";

const carsRouter = express.Router();

carsRouter
  .route("/")
  .post(authMiddleware(), uploadArray("imageUrls", 3, "cars"), createCar);

export default carsRouter;
