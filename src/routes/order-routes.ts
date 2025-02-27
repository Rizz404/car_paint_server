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
  cancelOrder,
  createOrderWithPaymentRequest,
  cancelOrderWithPaymentRequest,
  getOrdersByWorkshopId,
} from "@/controller/order-controller";
import { authMiddleware } from "@/middlewares/auth";
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
  .get(authMiddleware(), validateRole(["ADMIN", "SUPER_ADMIN"]), getOrders)
  .post(authMiddleware(), validateRequest(createOrderSchema), createOrder)
  .delete(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    deleteAllOrder
  );

orderRouter
  .route("/payment-request")
  .post(authMiddleware(), createOrderWithPaymentRequest);

orderRouter
  .route("/workshop/:workshopId")
  .get(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    getOrdersByWorkshopId
  );

orderRouter
  .route("/multiple")
  .post(
    authMiddleware(),
    validateRole(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(createManyOrderSchema),
    createManyOrders
  );

orderRouter.route("/search").get(searchOrders);

orderRouter.route("/user").get(authMiddleware(), getCurrentUserOrders);

orderRouter
  .route("/payment-request/cancel/:orderId")
  .patch(authMiddleware(), cancelOrderWithPaymentRequest);

orderRouter.route("/cancel/:orderId").patch(authMiddleware(), cancelOrder);

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
