import {
  createOrder,
  createManyOrders,
  deleteAllOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  searchOrders,
  updateOrder,
  getCurrentUserOrders,
} from "@/controller/order-controller";
import { authMiddleware } from "@/middlewares/auth";
import { uploadSingle } from "@/playground/upload-file";
import { validateRequest } from "@/middlewares/validate-request";
import validateRole from "@/middlewares/validate-role";
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
  .post(authMiddleware(), validateRequest(createOrderSchema), createOrder)
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllOrder
  );

orderRouter.route("/user").get(authMiddleware(), getCurrentUserOrders);

orderRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyOrderSchema),
    createManyOrders
  );

orderRouter.route("/search").get(searchOrders);
orderRouter
  .route("/:orderId")
  .get(getOrderById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(updateOrderSchema),
    updateOrder
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteOrder
  );

export default orderRouter;
