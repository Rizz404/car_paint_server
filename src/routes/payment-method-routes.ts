import {
  createPaymentMethod,
  createManyPaymentMethods,
  deleteAllPaymentMethod,
  deletePaymentMethod,
  getPaymentMethodById,
  getPaymentMethods,
  searchPaymentMethods,
  updatePaymentMethod,
  getPaymentMethodsFromXendit,
} from "@/controller/payment-method-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/playground/upload-file";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import {
  createPaymentMethodSchema,
  createManyPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "@/validation/payment-method-validation";
import express from "express";
import { parseFiles, uploadFilesToCloudinary } from "@/middlewares/upload-file";

const paymentMethodRouter = express.Router();

paymentMethodRouter
  .route("/")
  .get(getPaymentMethods)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    parseFiles.single("logoUrl"),
    validateRequest(createPaymentMethodSchema),
    uploadFilesToCloudinary("payment-methods"),
    createPaymentMethod
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllPaymentMethod
  );

paymentMethodRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyPaymentMethodSchema),
    createManyPaymentMethods
  );

paymentMethodRouter.route("/xendit").get(getPaymentMethodsFromXendit);

paymentMethodRouter.route("/search").get(searchPaymentMethods);
paymentMethodRouter
  .route("/:paymentMethodId")
  .get(getPaymentMethodById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    parseFiles.single("logoUrl"),
    validateRequest(updatePaymentMethodSchema),
    uploadFilesToCloudinary("payment-methods"),
    updatePaymentMethod
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deletePaymentMethod
  );

export default paymentMethodRouter;
