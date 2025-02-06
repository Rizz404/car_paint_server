import {
  createOrder,
  createManyOrders,
  deleteAllOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  searchOrders,
  updateOrder,
} from "@/controller/order-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
import {
  createOrderSchema,
  createManyOrderSchema,
  updateOrderSchema,
} from "@/validation/order-validation";
import express from "express";

const orderRouter = express.Router();

orderRouter
  .route("/")
  .get(getOrders)
  .post(authMiddleware(), validateBody(createOrderSchema), createOrder)
  .delete(authMiddleware(), deleteAllOrder);

orderRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateBody(createManyOrderSchema),
    createManyOrders
  );

orderRouter.route("/search").get(searchOrders);
orderRouter
  .route("/:orderId")
  .get(getOrderById)
  .patch(authMiddleware(), validateBody(updateOrderSchema), updateOrder)
  .delete(authMiddleware(), deleteOrder);

export default orderRouter;
