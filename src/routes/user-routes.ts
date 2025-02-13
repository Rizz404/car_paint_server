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
import { validateBody } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
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
  .get(authMiddleware(), validateRole(["ADMIN", "SUPER_ADMIN"]), getUsers)
  .post(
    authMiddleware(),
    // validateRole(["ADMIN", "SUPER_ADMIN"]),
    uploadSingle("profileImage", "profile-images"),
    validateBody(createUserSchema),
    createUser
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllUser
  );
userRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateBody(createManyUserSchema),
    createManyUsers
  );
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
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateBody(updateUserSchema),
    updateUser
  )
  .delete(authMiddleware(), validateRole(["ADMIN", "SUPER_ADMIN"]), deleteUser);

export default userRouter;
