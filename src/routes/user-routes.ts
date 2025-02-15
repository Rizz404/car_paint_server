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
import { parseFiles, uploadFilesToCloudinary } from "@/middlewares/upload-file";
import { validateRequest } from "@/middlewares/validate-request";
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
    parseFiles.single("profileImage"),
    validateRequest(createUserSchema),
    uploadFilesToCloudinary("profile-images"),
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
    validateRequest(createManyUserSchema),
    createManyUsers
  );
userRouter.route("/search").get(searchUsers);
userRouter
  .route("/current")
  .get(authMiddleware(), getCurrentUser)
  .patch(
    authMiddleware(),
    parseFiles.single("profileImage"),
    validateRequest(updateCurrentUserSchema),
    uploadFilesToCloudinary("profile-images"),
    updateCurrentUser
  );
userRouter
  .route("/current/password")
  .patch(
    authMiddleware(),
    validateRequest(updateCurrentUserPasswordSchema),
    updateCurrentUserPassword
  );
userRouter
  .route("/:userId")
  .get(getUserById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    parseFiles.single("profileImage"),
    validateRequest(updateUserSchema),
    uploadFilesToCloudinary("profile-images"),
    updateUser
  )
  .delete(authMiddleware(), validateRole(["ADMIN", "SUPER_ADMIN"]), deleteUser);

export default userRouter;
