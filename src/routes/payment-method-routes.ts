import {
  createPaymentMethod,
  createManyPaymentMethods,
  deleteAllPaymentMethod,
  deletePaymentMethod,
  getPaymentMethodById,
  getPaymentMethods,
  searchPaymentMethods,
  updatePaymentMethod,
} from "@/controller/payment-method-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createPaymentMethodSchema,
  createManyPaymentMethodSchema,
  updatePaymentMethodSchema,
} from "@/validation/payment-method-validation";
import express from "express";

const paymentMethodRouter = express.Router();

paymentMethodRouter
  .route("/")
  .get(getPaymentMethods)
  .post(
    authMiddleware(),
    validateBody(createPaymentMethodSchema),
    createPaymentMethod
  )
  .delete(authMiddleware(), deleteAllPaymentMethod);

paymentMethodRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyPaymentMethodSchema),
    createManyPaymentMethods
  );

paymentMethodRouter.route("/search").get(searchPaymentMethods);
paymentMethodRouter
  .route("/:paymentMethodId")
  .get(getPaymentMethodById)
  .patch(
    authMiddleware(),
    validateBody(updatePaymentMethodSchema),
    updatePaymentMethod
  )
  .delete(authMiddleware(), deletePaymentMethod);

export default paymentMethodRouter;
