import {
  createTransaction,
  createManyTransactions,
  deleteAllTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  searchTransactions,
  updateTransaction,
  getCurrentUserTransactions,
  confirmTransaction,
} from "@/controller/transaction-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/playground/upload-file";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
import {
  createTransactionSchema,
  createManyTransactionSchema,
  updateTransactionSchema,
} from "@/validation/transaction-validation";
import express from "express";

const transactionRouter = express.Router();

transactionRouter
  .route("/")
  .get(getTransactions)
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createTransactionSchema),
    createTransaction
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllTransaction
  );

transactionRouter.route("/webhook/xendit").post(confirmTransaction);

transactionRouter
  .route("/user")
  .get(authMiddleware(), getCurrentUserTransactions);

transactionRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyTransactionSchema),
    createManyTransactions
  );

transactionRouter.route("/search").get(searchTransactions);
transactionRouter
  .route("/:transactionId")
  .get(getTransactionById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateTransactionSchema),
    updateTransaction
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteTransaction
  );

export default transactionRouter;
