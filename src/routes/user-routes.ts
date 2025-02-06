import {
  createUser,
  createManyUsers,
  deleteAllUser,
  deleteUser,
  getUserById,
  getUsers,
  searchUsers,
  updateUser,
  getCurrentUser,
  updateCurrentUser,
  updateCurrentUserPassword,
} from "@/controller/user-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createUserSchema,
  createManyUserSchema,
} from "@/validation/user-validation";
import express from "express";

const userRouter = express.Router();

userRouter
  .route("/")
  .get(getUsers)
  .post(authMiddleware(), validateBody(createUserSchema), createUser)
  .delete(authMiddleware(), deleteAllUser);
userRouter
  .route("/multiple")
  .post(authMiddleware(), validateBody(createManyUserSchema), createManyUsers);
userRouter.route("/search").get(searchUsers);
userRouter
  .route("/current")
  .get(authMiddleware(), getCurrentUser)
  .patch(authMiddleware(), updateCurrentUser);
userRouter
  .route("/current/password")
  .patch(authMiddleware(), updateCurrentUserPassword);
userRouter
  .route("/:userId")
  .get(getUserById)
  .patch(authMiddleware(), validateBody(createUserSchema), updateUser)
  .delete(authMiddleware(), deleteUser);

export default userRouter;
