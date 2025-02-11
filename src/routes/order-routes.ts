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
import { uploadSingle } from "@/middlewares/upload-file";
import { validateBody } from "@/middlewares/validate-body";
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
  .post(authMiddleware(), validateBody(createOrderSchema), createOrder)
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
    validateBody(createManyOrderSchema),
    createManyOrders
  );

orderRouter.route("/search").get(searchOrders);
orderRouter
  .route("/:orderId")
  .get(getOrderById)
  .patch(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateBody(updateOrderSchema),
    updateOrder
  )
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteOrder
  );

export default orderRouter;
