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
} from "@/controller/transaction-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
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
    validateBody(createTransactionSchema),
    createTransaction
  )
  .delete(authMiddleware(), deleteAllTransaction);

transactionRouter
  .route("/user")
  .get(authMiddleware(), getCurrentUserTransactions);

transactionRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyTransactionSchema),
    createManyTransactions
  );

transactionRouter.route("/search").get(searchTransactions);
transactionRouter
  .route("/:transactionId")
  .get(getTransactionById)
  .patch(
    authMiddleware(),
    validateBody(updateTransactionSchema),
    updateTransaction
  )
  .delete(authMiddleware(), deleteTransaction);

export default transactionRouter;
