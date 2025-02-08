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
  updateUserSchema,
  updateCurrentUserSchema,
  updateCurrentUserPasswordSchema,
} from "@/validation/user-validation";
import express from "express";

const userRouter = express.Router();

userRouter
  .route("/")
  .get(getUsers)
  .post(
    authMiddleware(),
    uploadSingle("profileImage", "profile-images"),
    validateBody(createUserSchema),
    createUser
  )
  .delete(authMiddleware(), deleteAllUser);
userRouter
  .route("/multiple")
  .post(authMiddleware(), validateBody(createManyUserSchema), createManyUsers);
userRouter.route("/search").get(searchUsers);
userRouter
  .route("/current")
  .get(authMiddleware(), getCurrentUser)
  .patch(
    authMiddleware(),
    uploadSingle("profileImage", "profile-images"),
    validateBody(updateCurrentUserSchema),
    updateCurrentUser
  );
userRouter
  .route("/current/password")
  .patch(
    authMiddleware(),
    validateBody(updateCurrentUserPasswordSchema),
    updateCurrentUserPassword
  );
userRouter
  .route("/:userId")
  .get(getUserById)
  .patch(authMiddleware(), validateBody(updateUserSchema), updateUser)
  .delete(authMiddleware(), deleteUser);

export default userRouter;
